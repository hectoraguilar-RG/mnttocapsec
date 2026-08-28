import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  UserCheck, 
  Clock, 
  Send,
  MapPin,
  X,
  BarChart3,
  ListTodo,
  FileText,
  Users,
  PieChart as PieIcon,
  MessageSquareShare,
  Camera,
  Calendar as CalendarIcon,
  Repeat,
  LogOut
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const supabase = createClient(
  'https://ujirmnokxcuyhkwdhted.supabase.co',
  'sb_publishable_7pKU6_eloYtapHo5bmAwFw_6nFAFx7w'
);

function obtenerNumeroSemana(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function obtenerInicioSemanaActual() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const lunes = new Date(d.setDate(diff));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

export default function App() {
  const [perfiles, setPerfiles] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pestañaActiva, setPestañaActiva] = useState('operacion');

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroTecnicoAdmin, setFiltroTecnicoAdmin] = useState('todos');
  const [tipoPeriodoReporte, setTipoPeriodoReporte] = useState('semanal');

  // Modales
  const [modalExpres, setModalExpres] = useState(false);
  const [modalBloqueo, setModalBloqueo] = useState(null);
  const [motivoBloqueo, setMotivoBloqueo] = useState('falta_material');
  const [detalleBloqueo, setDetalleBloqueo] = useState('');

  const [modalTerminar, setModalTerminar] = useState(null);
  const [notasCierre, setNotasCierre] = useState('');
  const [fotoAntes, setFotoAntes] = useState(null);
  const [fotoDespues, setFotoDespues] = useState(null);
  const [guardandoCierre, setGuardandoCierre] = useState(false);

  const [modalAvance, setModalAvance] = useState(null);
  const [porcentajeAvance, setPorcentajeAvance] = useState(50);
  const [notaAvance, setNotaAvance] = useState('');
  const [fotoAvance, setFotoAvance] = useState(null);
  const [reasignarA, setReasignarA] = useState('');
  const [guardandoAvance, setGuardandoAvance] = useState(false);

  // Formulario Asignación
  const hoyStr = new Date().toISOString().split('T')[0];
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    prioridad: 'media',
    fecha_programada: hoyStr,
    fecha_fin: hoyStr,
    es_recurrente: false,
    tecnicos_seleccionados: []
  });

  const [tareaExpres, setTareaExpres] = useState({
    ubicacion: '',
    descripcion: '',
    yaResuelto: true
  });

  // 1. Cargar perfiles y detectar si el celular ya tiene un usuario guardado
  useEffect(() => {
    cargarPerfilesYUsuario();
  }, []);

  // 2. Al cambiar de usuario, cargar sus tareas correspondientes
  useEffect(() => {
    if (usuarioActual) {
      cargarTareas();
    }
  }, [usuarioActual]);

  async function cargarPerfilesYUsuario() {
    setCargando(true);
    const { data: perfilesData } = await supabase.from('perfiles').select('*').order('nombre');
    if (perfilesData && perfilesData.length > 0) {
      setPerfiles(perfilesData);

      // Revisar si este dispositivo ya tiene guardado un perfil en memoria
      const idGuardado = localStorage.getItem('cap_mantenimiento_user_id');
      if (idGuardado) {
        const encontrado = perfilesData.find(p => p.id === idGuardado);
        if (encontrado) {
          setUsuarioActual(encontrado);
        }
      }
    }
    setCargando(false);
  }

  // Guardar usuario en el celular al seleccionarlo
  function seleccionarPerfil(perfil) {
    setUsuarioActual(perfil);
    localStorage.setItem('cap_mantenimiento_user_id', perfil.id);
  }

  // Cerrar sesión para cambiar de usuario
  function cerrarSesion() {
    localStorage.removeItem('cap_mantenimiento_user_id');
    setUsuarioActual(null);
    setTareas([]);
  }

  async function cargarTareas() {
    if (!usuarioActual) return;
    setCargando(true);

    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (usuarioActual.rol === 'admin') {
        setTareas(data);
      } else {
        const inicioSemana = obtenerInicioSemanaActual();
        const hoy = new Date().toISOString().split('T')[0];

        const filtradas = data.filter(t => {
          const fechaTarea = new Date(t.fecha_completada || t.fecha_programada);
          const esDeEstaSemana = fechaTarea >= inicioSemana;

          if (t.estado === 'completada' && !esDeEstaSemana) {
            return false;
          }

          const esFechaValida = t.fecha_programada <= hoy;
          const estaEnGrupo = t.tecnicos_ids && t.tecnicos_ids.includes(usuarioActual.id);
          const esIndividual = t.tecnico_id === usuarioActual.id;
          const esRelevoAbierto = t.estado === 'en_proceso' || t.estado === 'pendiente';

          return esFechaValida && (estaEnGrupo || esIndividual || esRelevoAbierto);
        });

        setTareas(filtradas);
      }
    }
    setCargando(false);
  }

  function procesarFoto(e, callback) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
        canvas.height = (img.width > MAX_WIDTH) ? (img.height * scale) : img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  }

  async function guardarCierreTarea() {
    if (!modalTerminar || !usuarioActual) return;
    setGuardandoCierre(true);

    const { error } = await supabase
      .from('tareas')
      .update({ 
        estado: 'completada', 
        fecha_completada: new Date().toISOString(),
        notas_cierre: notasCierre,
        foto_antes: fotoAntes,
        foto_despues: fotoDespues,
        descripcion: `${modalTerminar.descripcion ? modalTerminar.descripcion + '\n' : ''}[Concluida por ${usuarioActual.nombre.split(' ')[0]}]: ${notasCierre || 'Trabajo terminado'}`
      })
      .eq('id', modalTerminar.id);

    setGuardandoCierre(false);
    if (!error) {
      setModalTerminar(null);
      setNotasCierre('');
      setFotoAntes(null);
      setFotoDespues(null);
      cargarTareas();
      alert('¡Tarea completada con éxito!');
    }
  }

  async function guardarAvanceTurno() {
    if (!modalAvance || !notaAvance || !usuarioActual) return;
    setGuardandoAvance(true);

    await supabase.from('avances_tarea').insert({
      tarea_id: modalAvance.id,
      tecnico_id: usuarioActual.id,
      porcentaje_avance: porcentajeAvance,
      notas_avance: notaAvance,
      foto_avance: fotoAvance
    });

    const nuevosAsignados = reasignarA 
      ? Array.from(new Set([...(modalAvance.tecnicos_ids || []), reasignarA]))
      : modalAvance.tecnicos_ids;

    const { error } = await supabase.from('tareas').update({
      estado: 'en_proceso',
      tecnicos_ids: nuevosAsignados,
      foto_antes: fotoAvance || modalAvance.foto_antes,
      descripcion: `${modalAvance.descripcion ? modalAvance.descripcion + '\n' : ''}[Avance ${usuarioActual.nombre.split(' ')[0]} ${porcentajeAvance}%]: ${notaAvance}`
    }).eq('id', modalAvance.id);

    setGuardandoAvance(false);
    if (!error) {
      setModalAvance(null);
      setNotaAvance('');
      setFotoAvance(null);
      setReasignarA('');
      cargarTareas();
      alert('Avance y relevo guardados.');
    }
  }

  async function guardarBloqueo() {
    if (!modalBloqueo) return;

    await supabase.from('bloqueos_tarea').insert({
      tarea_id: modalBloqueo.id,
      motivo: motivoBloqueo,
      detalle: detalleBloqueo
    });

    await supabase.from('tareas').update({ estado: 'bloqueada' }).eq('id', modalBloqueo.id);

    setModalBloqueo(null);
    setDetalleBloqueo('');
    cargarTareas();
  }

  async function crearTareaProgramada(e) {
    e.preventDefault();
    if (!nuevaTarea.titulo || !nuevaTarea.ubicacion || nuevaTarea.tecnicos_seleccionados.length === 0) {
      alert('Completa los campos requeridos y selecciona al menos a un técnico.');
      return;
    }

    const registrosParaInsertar = [];
    const fechaInicio = new Date(nuevaTarea.fecha_programada + 'T00:00:00');
    const fechaFin = nuevaTarea.es_recurrente ? new Date(nuevaTarea.fecha_fin + 'T00:00:00') : fechaInicio;

    for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
      const diaSemana = d.getDay();
      if (nuevaTarea.es_recurrente && (diaSemana === 0 || diaSemana === 6)) {
        continue;
      }

      registrosParaInsertar.push({
        titulo: nuevaTarea.titulo,
        descripcion: nuevaTarea.descripcion,
        ubicacion: nuevaTarea.ubicacion,
        prioridad: nuevaTarea.prioridad,
        tecnico_id: nuevaTarea.tecnicos_seleccionados[0],
        tecnicos_ids: nuevaTarea.tecnicos_seleccionados,
        creado_por: usuarioActual?.id,
        tipo_origen: 'programada',
        estado: 'pendiente',
        fecha_programada: d.toISOString().split('T')[0]
      });
    }

    const { error } = await supabase.from('tareas').insert(registrosParaInsertar);

    if (!error) {
      const nombresTecnicos = perfiles
        .filter(p => nuevaTarea.tecnicos_seleccionados.includes(p.id))
        .map(p => p.nombre.split(' ')[0])
        .join(', ');

      const mensajeWhatsApp = encodeURIComponent(
        `🛠️ *NUEVA ORDEN DE TRABAJO*\n\n` +
        `📋 *Actividad:* ${nuevaTarea.titulo}\n` +
        `📍 *Ubicación:* ${nuevaTarea.ubicacion}\n` +
        `👥 *Responsable(s):* ${nombresTecnicos}\n` +
        `📅 *Fecha:* ${nuevaTarea.fecha_programada}${nuevaTarea.es_recurrente ? ' al ' + nuevaTarea.fecha_fin + ' (Lun-Vie)' : ''}\n` +
        (nuevaTarea.descripcion ? `📝 *Detalle:* ${nuevaTarea.descripcion}\n\n` : '\n') +
        `📲 *Ver en App:* https://mnttocapsec.vercel.app`
      );

      setNuevaTarea({ 
        titulo: '', 
        descripcion: '', 
        ubicacion: '', 
        prioridad: 'media', 
        fecha_programada: hoyStr,
        fecha_fin: hoyStr,
        es_recurrente: false,
        tecnicos_seleccionados: [] 
      });
      cargarTareas();

      if (window.confirm('Orden generada con éxito. ¿Deseas enviar el aviso a WhatsApp ahora?')) {
        window.open(`https://api.whatsapp.com/send?text=${mensajeWhatsApp}`, '_blank');
      }
    }
  }

  async function guardarTareaExpres() {
    if (!tareaExpres.ubicacion || !tareaExpres.descripcion || !usuarioActual) return;

    const { error } = await supabase.from('tareas').insert({
      titulo: `Atención rápida: ${tareaExpres.descripcion.slice(0, 35)}...`,
      descripcion: tareaExpres.descripcion,
      ubicacion: tareaExpres.ubicacion,
      prioridad: 'media',
      tipo_origen: 'en_recorrido',
      estado: tareaExpres.yaResuelto ? 'completada' : 'pendiente',
      tecnico_id: usuarioActual.id,
      tecnicos_ids: [usuarioActual.id],
      fecha_programada: hoyStr,
      fecha_completada: tareaExpres.yaResuelto ? new Date().toISOString() : null
    });

    if (!error) {
      setModalExpres(false);
      setTareaExpres({ ubicacion: '', descripcion: '', yaResuelto: true });
      cargarTareas();
    }
  }

  function alternarTecnicoSeleccionado(id) {
    setNuevaTarea(prev => {
      const existe = prev.tecnicos_seleccionados.includes(id);
      return {
        ...prev,
        tecnicos_seleccionados: existe
          ? prev.tecnicos_seleccionados.filter(tId => tId !== id)
          : [...prev.tecnicos_seleccionados, id]
      };
    });
  }

  // Filtrado de Tareas
  const tareasFiltradas = tareas.filter(t => {
    if (usuarioActual?.rol === 'admin' && filtroTecnicoAdmin !== 'todos') {
      const corresponde = t.tecnico_id === filtroTecnicoAdmin || t.tecnicos_ids?.includes(filtroTecnicoAdmin);
      if (!corresponde) return false;
    }

    if (filtroEstado === 'pendientes') return t.estado === 'pendiente';
    if (filtroEstado === 'en_proceso') return t.estado === 'en_proceso';
    if (filtroEstado === 'bloqueadas') return t.estado === 'bloqueada';
    if (filtroEstado === 'completadas') return t.estado === 'completada';
    return true;
  });

  const fechaActual = new Date();
  const numeroSemana = obtenerNumeroSemana(fechaActual);

  const tareasReporte = tareas.filter(t => {
    const fechaRef = new Date(t.fecha_completada || t.fecha_programada);
    const ahora = new Date();

    if (tipoPeriodoReporte === 'semanal') {
      const inicioSemana = obtenerInicioSemanaActual();
      return fechaRef >= inicioSemana;
    } else if (tipoPeriodoReporte === 'quincenal') {
      const dias15Atras = new Date();
      dias15Atras.setDate(ahora.getDate() - 15);
      return fechaRef >= dias15Atras;
    } else {
      return fechaRef.getMonth() === ahora.getMonth() && fechaRef.getFullYear() === ahora.getFullYear();
    }
  });

  const totalCompletadasRep = tareasReporte.filter(t => t.estado === 'completada').length;
  const totalExpresRep = tareasReporte.filter(t => t.tipo_origen === 'en_recorrido').length;
  const totalBloqueadasRep = tareasReporte.filter(t => t.estado === 'bloqueada').length;
  const totalPendientesRep = tareasReporte.filter(t => t.estado !== 'completada').length;

  const tecnicosLista = perfiles.filter(p => p.rol === 'tecnico');

  const datosGraficaTecnicos = {
    labels: tecnicosLista.map(t => t.nombre.split(' ')[0]),
    datasets: [
      {
        label: 'Completadas',
        data: tecnicosLista.map(t => tareasReporte.filter(tar => (tar.tecnico_id === t.id || tar.tecnicos_ids?.includes(t.id)) && tar.estado === 'completada').length),
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        label: 'Pendientes / En Proceso',
        data: tecnicosLista.map(t => tareasReporte.filter(tar => (tar.tecnico_id === t.id || tar.tecnicos_ids?.includes(t.id)) && tar.estado !== 'completada').length),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  };

  const opcionesBarra = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
    },
    scales: {
      x: {
        ticks: { autoSkip: false, font: { size: 11, weight: '600' }, color: '#1e293b' },
        grid: { display: false }
      },
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } }
    }
  };

  const datosGraficaOrigen = {
    labels: ['Programadas Concluidas', 'Exprés en Recorrido', 'Bloqueadas por Insumos'],
    datasets: [{
      data: [
        tareasReporte.filter(t => t.tipo_origen === 'programada' && t.estado === 'completada').length || 1,
        totalExpresRep || 1,
        totalBloqueadasRep || 0
      ],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b']
    }]
  };

  const opcionesDona = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10, weight: '600' }, padding: 12 } }
    }
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const etiquetaPeriodo = tipoPeriodoReporte === 'semanal' 
    ? `Reporte Semanal • Semana ${numeroSemana} (${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()})`
    : tipoPeriodoReporte === 'quincenal'
    ? `Reporte Quincenal • Últimos 15 días (${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()})`
    : `Reporte Mensual • Mes de ${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

  // ===================== PANTALLA INICIAL DE SELECCIÓN =====================
  if (!usuarioActual) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md">
              <Wrench className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Control de Mantenimiento</h1>
            <p className="text-xs text-slate-500">Colegio Americano de Puebla • Selecciona tu perfil</p>
          </div>

          <div className="space-y-2.5">
            {perfiles.map(p => (
              <button
                key={p.id}
                onClick={() => seleccionarPerfil(p)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                  p.rol === 'admin' 
                    ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div>
                  <p className="font-bold text-sm">{p.nombre}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{p.rol === 'admin' ? 'Coordinador / Supervisor' : 'Técnico de Mantenimiento'}</p>
                </div>
                <UserCheck className={`w-5 h-5 ${p.rol === 'admin' ? 'text-blue-600' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>

          <p className="text-[10px] text-center text-slate-400">Tu selección se recordará automáticamente en este dispositivo.</p>
        </div>
      </div>
    );
  }

  // ===================== APLICACIÓN PRINCIPAL =====================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-28 font-sans">
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md p-4 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight">Control de Mantenimiento Menor</h1>
              <p className="text-[11px] text-slate-400">Campus Operativo</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {usuarioActual.rol === 'admin' && (
              <div className="bg-slate-800 p-1 rounded-lg flex text-xs font-semibold">
                <button 
                  onClick={() => setPestañaActiva('operacion')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                    pestañaActiva === 'operacion' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" /> Operación
                </button>
                <button 
                  onClick={() => setPestañaActiva('ejecutivo')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                    pestañaActiva === 'ejecutivo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Panel Ejecutivo
                </button>
              </div>
            )}

            {/* Perfil Activo con Botón de Salir */}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs font-semibold text-blue-300">
                👤 {usuarioActual.nombre.split(' ')[0]}
              </span>
              <button 
                onClick={cerrarSesion}
                title="Cambiar de usuario"
                className="text-slate-400 hover:text-rose-400 transition ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {pestañaActiva === 'operacion' && (
          <>
            {/* Formulario solo visible para Administrador */}
            {usuarioActual.rol === 'admin' && (
              <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" /> Asignar / Programar Orden de Trabajo
                </h2>
                <form onSubmit={crearTareaProgramada} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">Título de la actividad</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Montaje y desmontaje de silletería / Cobertura de área" 
                      value={nuevaTarea.titulo}
                      onChange={e => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">Ubicación</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Auditorio / Canchas / Edificio Central" 
                      value={nuevaTarea.ubicacion}
                      onChange={e => setNuevaTarea({...nuevaTarea, ubicacion: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> Fecha Inicio
                    </label>
                    <input 
                      type="date" 
                      value={nuevaTarea.fecha_programada}
                      onChange={e => setNuevaTarea({...nuevaTarea, fecha_programada: e.target.value, fecha_fin: e.target.value > nuevaTarea.fecha_fin ? e.target.value : nuevaTarea.fecha_fin})}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-slate-600 flex items-center gap-1">
                        <Repeat className="w-3.5 h-3.5 text-purple-600" /> ¿Repetir diaria?
                      </label>
                      <label className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={nuevaTarea.es_recurrente}
                          onChange={e => setNuevaTarea({...nuevaTarea, es_recurrente: e.target.checked})}
                          className="rounded accent-purple-600"
                        />
                        Lunes a Viernes
                      </label>
                    </div>

                    <input 
                      type="date" 
                      disabled={!nuevaTarea.es_recurrente}
                      value={nuevaTarea.fecha_fin}
                      onChange={e => setNuevaTarea({...nuevaTarea, fecha_fin: e.target.value})}
                      className={`w-full p-2.5 rounded-lg border focus:outline-none font-medium ${nuevaTarea.es_recurrente ? 'border-purple-300 bg-purple-50/50 text-slate-800' : 'border-slate-200 bg-slate-100 text-slate-400'}`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">
                      Equipo responsable: (Selecciona 1 o más colaboradores)
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tecnicosLista.map(t => {
                        const seleccionado = nuevaTarea.tecnicos_seleccionados.includes(t.id);
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => alternarTecnicoSeleccionado(t.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                              seleccionado 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            {t.nombre.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">Instrucciones o requerimientos</label>
                    <textarea 
                      rows={2}
                      placeholder="Detalles sobre herramientas, alcance o especificaciones..."
                      value={nuevaTarea.descripcion}
                      onChange={e => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Guardar y Notificar Orden de Trabajo
                  </button>
                </form>
              </section>
            )}

            {/* Listado de Tareas */}
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {usuarioActual.rol === 'admin' ? 'Órdenes de Trabajo del Plantel' : 'Mis Tareas de la Semana'}
                </h3>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {usuarioActual.rol === 'admin' && (
                    <select
                      value={filtroTecnicoAdmin}
                      onChange={e => setFiltroTecnicoAdmin(e.target.value)}
                      className="text-xs bg-white border border-slate-300 font-medium px-2.5 py-1 rounded-lg focus:outline-none text-slate-700"
                    >
                      <option value="todos">👥 Ver todo el equipo</option>
                      {tecnicosLista.map(t => (
                        <option key={t.id} value={t.id}>Filtrar solo {t.nombre.split(' ')[0]}</option>
                      ))}
                    </select>
                  )}
                  <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    {tareasFiltradas.length} órdenes
                  </span>
                </div>
              </div>

              {cargando ? (
                <p className="text-xs text-slate-400 text-center py-8">Cargando datos...</p>
              ) : tareasFiltradas.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  No hay tareas registradas con este filtro.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tareasFiltradas.map(t => {
                    const nombresAsignados = perfiles
                      .filter(p => t.tecnicos_ids?.includes(p.id) || p.id === t.tecnico_id)
                      .map(p => p.nombre.split(' ')[0])
                      .join(' + ') || 'Sin asignar';

                    return (
                      <div 
                        key={t.id} 
                        className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                          t.estado === 'completada' ? 'border-emerald-200 bg-emerald-50/30' : 
                          t.estado === 'bloqueada' ? 'border-amber-200 bg-amber-50/20' : 
                          t.estado === 'en_proceso' ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              t.tipo_origen === 'en_recorrido' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {t.tipo_origen === 'en_recorrido' ? 'En Recorrido' : 'Programada'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-500" /> {nombresAsignados}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm mb-1">{t.titulo}</h4>
                          {t.descripcion && (
                            <p className="text-xs text-slate-600 mb-2 whitespace-pre-line bg-slate-50 p-2 rounded border border-slate-100">
                              {t.descripcion}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium mb-3">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{t.ubicacion}</span>
                            </div>
                            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                              📅 {t.fecha_programada}
                            </span>
                          </div>

                          {t.estado === 'completada' && (t.foto_antes || t.foto_despues) && (
                            <div className="flex gap-3 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                              {t.foto_antes && (
                                <div className="text-[10px] text-slate-500 text-center">
                                  <span className="block mb-0.5">Antes</span>
                                  <img src={t.foto_antes} alt="Antes" className="w-16 h-16 object-cover rounded-lg border shadow-xs" />
                                </div>
                              )}
                              {t.foto_despues && (
                                <div className="text-[10px] text-slate-500 text-center">
                                  <span className="block mb-0.5">Después</span>
                                  <img src={t.foto_despues} alt="Después" className="w-16 h-16 object-cover rounded-lg border shadow-xs" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {t.estado !== 'completada' && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            <button 
                              onClick={() => {
                                setModalTerminar(t);
                                setNotasCierre('');
                                setFotoAntes(t.foto_antes || null);
                                setFotoDespues(null);
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Concluir / Fotos
                            </button>

                            <button 
                              onClick={() => {
                                setModalAvance(t);
                                setFotoAvance(null);
                                setNotaAvance('');
                              }}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                            >
                              <MessageSquareShare className="w-4 h-4" /> Relevo
                            </button>

                            <button 
                              onClick={() => setModalBloqueo(t)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold py-2 px-2 rounded-lg flex items-center justify-center transition"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Panel Ejecutivo */}
        {pestañaActiva === 'ejecutivo' && usuarioActual.rol === 'admin' && (
          <section className="space-y-5 print:space-y-4 print:p-0">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:border-b-2 print:border-slate-800 print:shadow-none print:p-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md print:bg-transparent print:p-0">
                  {etiquetaPeriodo}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 print:text-lg">Reporte de Desempeño Operativo</h2>
                <p className="text-xs text-slate-500">Colegio Americano de Puebla • Mantenimiento Menor e Instalaciones</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto print:hidden">
                <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
                  <button 
                    onClick={() => setTipoPeriodoReporte('semanal')}
                    className={`px-3 py-1.5 rounded-lg transition ${tipoPeriodoReporte === 'semanal' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                  >
                    Semana {numeroSemana}
                  </button>
                  <button 
                    onClick={() => setTipoPeriodoReporte('quincenal')}
                    className={`px-3 py-1.5 rounded-lg transition ${tipoPeriodoReporte === 'quincenal' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                  >
                    Quincenal
                  </button>
                  <button 
                    onClick={() => setTipoPeriodoReporte('mensual')}
                    className={`px-3 py-1.5 rounded-lg transition ${tipoPeriodoReporte === 'mensual' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                  >
                    Mensual
                  </button>
                </div>

                <button 
                  onClick={() => window.print()} 
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <FileText className="w-4 h-4" /> Exportar PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm print:border print:p-2.5">
                <p className="text-[11px] text-slate-500 font-medium">Concluidas</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5 print:text-xl">{totalCompletadasRep}</p>
                <span className="text-[9px] text-slate-400">Total en periodo</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm print:border print:p-2.5">
                <p className="text-[11px] text-slate-500 font-medium">Exprés en Recorrido</p>
                <p className="text-2xl font-bold text-purple-600 mt-0.5 print:text-xl">{totalExpresRep}</p>
                <span className="text-[9px] text-slate-400">Atenciones rápidas</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm print:border print:p-2.5">
                <p className="text-[11px] text-slate-500 font-medium">Detenidas (Compras)</p>
                <p className="text-2xl font-bold text-amber-600 mt-0.5 print:text-xl">{totalBloqueadasRep}</p>
                <span className="text-[9px] text-slate-400">Falta insumo / prov.</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm print:border print:p-2.5">
                <p className="text-[11px] text-slate-500 font-medium">En Curso / Pendientes</p>
                <p className="text-2xl font-bold text-blue-600 mt-0.5 print:text-xl">{totalPendientesRep}</p>
                <span className="text-[9px] text-slate-400">En programación</span>
              </div>
            </div>

            <div className="space-y-4 print:space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:border print:p-3">
                <h3 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <BarChart3 className="w-4 h-4 text-blue-600" /> Rendimiento y Conclusión por Colaborador
                </h3>
                <div className="h-56 print:h-48 w-full">
                  <Bar data={datosGraficaTecnicos} options={opcionesBarra} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:border print:p-3">
                <h3 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <PieIcon className="w-4 h-4 text-emerald-600" /> Distribución de Órdenes y Tipo de Atención
                </h3>
                <div className="h-44 print:h-40 flex justify-center w-full">
                  <Doughnut data={datosGraficaOrigen} options={opcionesDona} />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:border print:p-3 print:break-inside-avoid">
              <h3 className="font-bold text-xs text-slate-700 mb-2 uppercase tracking-wide">
                Desglose de Trabajos Concluidos ({totalCompletadasRep})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="p-2">Actividad / Ubicación</th>
                      <th className="p-2">Origen</th>
                      <th className="p-2">Responsable(s)</th>
                      <th className="p-2">Notas de Cierre</th>
                      <th className="p-2 text-center">Fotos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tareasReporte.filter(t => t.estado === 'completada').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          Sin órdenes completadas registradas en este periodo.
                        </td>
                      </tr>
                    ) : (
                      tareasReporte.filter(t => t.estado === 'completada').map(t => {
                        const nombres = perfiles
                          .filter(p => t.tecnicos_ids?.includes(p.id) || p.id === t.tecnico_id)
                          .map(p => p.nombre.split(' ')[0])
                          .join(' + ');

                        return (
                          <tr key={t.id}>
                            <td className="p-2">
                              <p className="font-bold text-slate-800">{t.titulo}</p>
                              <p className="text-[11px] text-slate-500">{t.ubicacion}</p>
                            </td>
                            <td className="p-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                t.tipo_origen === 'en_recorrido' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {t.tipo_origen === 'en_recorrido' ? 'Exprés' : 'Programada'}
                              </span>
                            </td>
                            <td className="p-2 font-medium text-slate-700">{nombres}</td>
                            <td className="p-2 text-slate-600 max-w-xs truncate">{t.notas_cierre || 'Concluido'}</td>
                            <td className="p-2 text-center">
                              <div className="flex justify-center gap-1">
                                {t.foto_antes && <span className="text-[10px] bg-slate-100 px-1 rounded">Antes</span>}
                                {t.foto_despues && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">Después</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* BARRA INFERIOR DE FILTROS */}
      {pestañaActiva === 'operacion' && (
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-full shadow-2xl border border-slate-700 z-40 flex items-center gap-1.5 max-w-[95vw] overflow-x-auto print:hidden">
          <button 
            onClick={() => setFiltroEstado('todas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'todas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFiltroEstado('pendientes')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'pendientes' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏳ Pendientes
          </button>
          <button 
            onClick={() => setFiltroEstado('en_proceso')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'en_proceso' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔄 Relevos
          </button>
          <button 
            onClick={() => setFiltroEstado('bloqueadas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'bloqueadas' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚠️ Bloqueadas
          </button>
          <button 
            onClick={() => setFiltroEstado('completadas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'completadas' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✅ Terminadas (Semana {numeroSemana})
          </button>
        </nav>
      )}

      {/* BOTÓN FLOTANTE TÉCNICO */}
      {usuarioActual.rol === 'tecnico' && pestañaActiva === 'operacion' && (
        <button 
          onClick={() => setModalExpres(true)}
          className="fixed bottom-16 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 font-bold text-xs transition z-30 transform active:scale-95 print:hidden"
        >
          <PlusCircle className="w-4 h-4" /> + Exprés
        </button>
      )}

      {/* MODAL CONCLUIR */}
      {modalTerminar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Concluir Orden de Trabajo</h3>
                <p className="text-[11px] text-slate-500">{modalTerminar.titulo}</p>
              </div>
              <button onClick={() => setModalTerminar(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Notas de conclusión</label>
                <textarea 
                  rows={2} 
                  placeholder="Describe el trabajo finalizado..."
                  value={notasCierre}
                  onChange={e => setNotasCierre(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Foto Antes</label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition min-h-[90px]">
                    {fotoAntes ? (
                      <img src={fotoAntes} alt="Antes" className="w-full h-16 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">Subir foto</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => procesarFoto(e, setFotoAntes)} />
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Foto Después</label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition min-h-[90px]">
                    {fotoDespues ? (
                      <img src={fotoDespues} alt="Después" className="w-full h-16 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">Subir foto</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => procesarFoto(e, setFotoDespues)} />
                  </label>
                </div>
              </div>
            </div>

            <button 
              onClick={guardarCierreTarea}
              disabled={guardandoCierre}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg shadow-md transition"
            >
              {guardandoCierre ? 'Guardando...' : 'Finalizar y Guardar Evidencia'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL AVANCE */}
      {modalAvance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Registrar Avance / Relevo</h3>
              <button onClick={() => setModalAvance(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Porcentaje avanzado: ({porcentajeAvance}%)
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="90" 
                  step="10"
                  value={porcentajeAvance}
                  onChange={e => setPorcentajeAvance(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">¿Qué dejaste listo y qué falta?</label>
                <textarea 
                  rows={3} 
                  placeholder="Detalle para el compañero que releva..."
                  value={notaAvance}
                  onChange={e => setNotaAvance(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Foto de evidencia de avance</label>
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition">
                  {fotoAvance ? (
                    <img src={fotoAvance} alt="Avance" className="w-full h-16 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-slate-400 mb-0.5" />
                      <span className="text-[10px] text-slate-500">Tomar foto de lo avanzado</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => procesarFoto(e, setFotoAvance)} />
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Pasar relevo directo a:</label>
                <select 
                  value={reasignarA}
                  onChange={e => setReasignarA(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Dejar abierto para cualquier compañero</option>
                  {tecnicosLista.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={guardarAvanceTurno}
              disabled={guardandoAvance}
              className="w-full bg-blue-600 text-white font-bold text-xs py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              {guardandoAvance ? 'Guardando...' : 'Guardar Avance de Turno'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL EXPRÉS */}
      {modalExpres && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Nueva Atención en Recorrido</h3>
              <button onClick={() => setModalExpres(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">¿Dónde fue?</label>
                <input 
                  type="text" 
                  placeholder="Ej. Pasillo 3 / Cafetería" 
                  value={tareaExpres.ubicacion}
                  onChange={e => setTareaExpres({...tareaExpres, ubicacion: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">¿Qué se realizó?</label>
                <textarea 
                  rows={2} 
                  placeholder="Ej. Ajuste rápido de cerradura" 
                  value={tareaExpres.descripcion}
                  onChange={e => setTareaExpres({...tareaExpres, descripcion: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">¿Ya quedó solucionado?</label>
                <select 
                  value={tareaExpres.yaResuelto ? 'si' : 'no'}
                  onChange={e => setTareaExpres({...tareaExpres, yaResuelto: e.target.value === 'si'})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="si">✅ Sí, ya quedó lista (Cerrar ahora)</option>
                  <option value="no">⏳ No, requiere atención posterior</option>
                </select>
              </div>
            </div>
            <button 
              onClick={guardarTareaExpres}
              className="w-full bg-blue-600 text-white font-bold text-xs py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Guardar Registro
            </button>
          </div>
        </div>
      )}

      {/* MODAL BLOQUEO */}
      {modalBloqueo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Reportar Bloqueo / Falta de Insumo</h3>
              <button onClick={() => setModalBloqueo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Motivo</label>
                <select 
                  value={motivoBloqueo}
                  onChange={e => setMotivoBloqueo(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="falta_material">📦 Falta de Material en Almacén</option>
                  <option value="proveedor_externo">🛠️ Requiere Proveedor Externo</option>
                  <option value="apoyo_otra_area">👥 Requiere Apoyo de Otra Área</option>
                  <option value="otro">⚠️ Otro motivo</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">¿Qué material o proveedor se requiere?</label>
                <textarea 
                  rows={3} 
                  placeholder="Detalle para compras..."
                  value={detalleBloqueo}
                  onChange={e => setDetalleBloqueo(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <button 
              onClick={guardarBloqueo}
              className="w-full bg-amber-600 text-white font-bold text-xs py-3 rounded-lg shadow-md hover:bg-amber-700 transition"
            >
              Confirmar Bloqueo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
