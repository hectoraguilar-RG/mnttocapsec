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
  LogOut,
  Play,
  Trash2,
  Ban,
  RotateCcw,
  Pause,
  Download,
  Maximize2,
  Eye,
  RefreshCw,
  UserPlus,
  ArrowRightLeft,
  Link2
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
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [esStandalone, setEsStandalone] = useState(false);
  const [ahoraReloj, setAhoraReloj] = useState(Date.now());

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroTecnicoAdmin, setFiltroTecnicoAdmin] = useState('todos');
  const [tipoPeriodoReporte, setTipoPeriodoReporte] = useState('semanal');
  const [fechaReferenciaReporte, setFechaReferenciaReporte] = useState(new Date().toISOString().split('T')[0]);

  // Modales
  const [modalExpres, setModalExpres] = useState(false);
  const [modalBloqueo, setModalBloqueo] = useState(null);
  const [motivoBloqueo, setMotivoBloqueo] = useState('falta_material');
  const [detalleBloqueo, setDetalleBloqueo] = useState('');

  const [modalInicio, setModalInicio] = useState(null);
  const [notasInicio, setNotasInicio] = useState('');
  const [fotoInicio, setFotoInicio] = useState(null);
  const [guardandoInicio, setGuardandoInicio] = useState(false);
  const [tecnicosInicio, setTecnicosInicio] = useState([]);
  const [modalHistorial, setModalHistorial] = useState(null);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

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
    hora_programada: '',
    fecha_fin: hoyStr,
    es_recurrente: false,
    tecnicos_seleccionados: [],
    foto: null
  });

  const [tareaExpres, setTareaExpres] = useState({
    ubicacion: '',
    descripcion: '',
    yaResuelto: true,
    foto: null,
    tipoAtencion: 'hoy',
    fechaProgramada: hoyStr,
    asignadoA: '',
    tecnicos_seleccionados: []
  });
  const [guardandoExpres, setGuardandoExpres] = useState(false);
  const [ultimoActualizado, setUltimoActualizado] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [modalResponsables, setModalResponsables] = useState(null);
  const [responsablesSeleccionados, setResponsablesSeleccionados] = useState([]);
  const [notaCambioResponsables, setNotaCambioResponsables] = useState('');
  const [guardandoResponsables, setGuardandoResponsables] = useState(false);

  // Reloj visual para actualizar tiempos activos sin recargar la app
  useEffect(() => {
    const id = setInterval(() => setAhoraReloj(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // Configuración PWA: manifest, instalación y service worker
  useEffect(() => {
    const manifestExistente = document.querySelector('link[rel="manifest"]');
    if (!manifestExistente) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.webmanifest';
      document.head.appendChild(link);
    }

    const theme = document.querySelector('meta[name="theme-color"]') || document.createElement('meta');
    theme.name = 'theme-color';
    theme.content = '#0f172a';
    if (!theme.parentNode) document.head.appendChild(theme);

    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/icons/icon-192.png';
    if (!appleIcon.parentNode) document.head.appendChild(appleIcon);

    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setEsStandalone(standalone);

    const manejarPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', manejarPrompt);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('Service Worker:', err));
    }

    return () => window.removeEventListener('beforeinstallprompt', manejarPrompt);
  }, []);

  async function instalarApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

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


  // Actualización automática y al volver a la PWA.
  // Se usa un intervalo moderado para no gastar consultas innecesarias.
  useEffect(() => {
    if (!usuarioActual) return;

    const refrescarSilencioso = () => cargarTareas(true);
    const intervalo = setInterval(refrescarSilencioso, 60000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') refrescarSilencioso();
    };
    const alEnfocar = () => refrescarSilencioso();

    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alEnfocar);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alEnfocar);
    };
  }, [usuarioActual]);

  // Si se llega desde WhatsApp con ?tarea=UUID, abrir el detalle de esa actividad.
  useEffect(() => {
    if (!usuarioActual || tareas.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const tareaId = params.get('tarea');
    if (!tareaId) return;
    const encontrada = tareas.find(t => t.id === tareaId);
    if (encontrada) {
      abrirHistorial(encontrada);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [usuarioActual, tareas]);

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

  async function cargarTareas(silencioso = false) {
    if (!usuarioActual) return;
    if (silencioso) setActualizando(true);
    else setCargando(true);

    const [{ data, error }, { data: sesionesData, error: errorSesiones }] = await Promise.all([
      supabase.from('tareas').select('*').order('created_at', { ascending: false }),
      supabase.from('sesiones_tarea').select('*').order('fecha_inicio', { ascending: true })
    ]);

    if (!error && data) {
      if (errorSesiones) console.warn('No se pudieron cargar sesiones:', errorSesiones);
      const sesiones = sesionesData || [];
      const tareasConSesiones = data.map(t => ({
        ...t,
        _sesiones: sesiones.filter(s => s.tarea_id === t.id)
      }));

      if (usuarioActual.rol === 'admin') {
        setTareas(tareasConSesiones);
      } else {
        const inicioSemana = obtenerInicioSemanaActual();
        const hoy = new Date().toISOString().split('T')[0];

        const filtradas = tareasConSesiones.filter(t => {
          const fechaTarea = new Date(t.fecha_completada || t.fecha_programada);
          const esDeEstaSemana = fechaTarea >= inicioSemana;

          if (t.estado === 'completada' && !esDeEstaSemana) {
            return false;
          }

          const esFechaValida = t.fecha_programada <= hoy;
          const estaEnGrupo = t.tecnicos_ids && t.tecnicos_ids.includes(usuarioActual.id);
          const esIndividual = t.tecnico_id === usuarioActual.id;
          // Un técnico solo ve órdenes en las que está explícitamente asignado.
          return esFechaValida && (estaEnGrupo || esIndividual);
        });

        setTareas(filtradas);
      }
    }
    setUltimoActualizado(new Date());
    if (silencioso) setActualizando(false);
    else setCargando(false);
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

  function segundosTrabajadosTarea(tarea) {
    const idsTecnicos = new Set(perfiles.filter(p => p.rol === 'tecnico').map(p => p.id));
    return (tarea?._sesiones || []).reduce((total, sesion) => {
      if (!idsTecnicos.has(sesion.tecnico_id)) return total;
      const inicio = new Date(sesion.fecha_inicio).getTime();
      const fin = sesion.fecha_fin ? new Date(sesion.fecha_fin).getTime() : ahoraReloj;
      if (!inicio || fin < inicio) return total;
      return total + Math.floor((fin - inicio) / 1000);
    }, 0);
  }

  function formatearDuracion(segundos = 0) {
    const totalMin = Math.floor(segundos / 60);
    const horas = Math.floor(totalMin / 60);
    const minutos = totalMin % 60;
    if (horas > 0) return `${horas} h ${minutos} min`;
    if (minutos > 0) return `${minutos} min`;
    return segundos > 0 ? '< 1 min' : '0 min';
  }

  function sesionActivaDeUsuario(tarea) {
    if (usuarioActual?.rol !== 'tecnico') return null;
    return (tarea?._sesiones || []).find(s => s.tecnico_id === usuarioActual?.id && !s.fecha_fin);
  }

  function tecnicosAsignadosTarea(tarea) {
    const ids = Array.from(new Set([...(tarea?.tecnicos_ids || []), ...(tarea?.tecnico_id ? [tarea.tecnico_id] : [])]));
    return perfiles.filter(p => p.rol === 'tecnico' && ids.includes(p.id));
  }


  function estaAsignadoATarea(tarea, usuarioId = usuarioActual?.id) {
    if (!tarea || !usuarioId) return false;
    return tarea.tecnico_id === usuarioId || (tarea.tecnicos_ids || []).includes(usuarioId);
  }

  function puedeModificarTarea(tarea) {
    if (usuarioActual?.rol === 'admin') return true;
    return usuarioActual?.rol === 'tecnico' && estaAsignadoATarea(tarea);
  }

  function validarPermisoTarea(tarea, accion = 'modificar esta actividad') {
    if (puedeModificarTarea(tarea)) return true;
    alert(`No tienes autorización para ${accion}. La actividad no está asignada a tu perfil.`);
    return false;
  }

  function enlaceTarea(tareaId) {
    return `${window.location.origin}/?tarea=${encodeURIComponent(tareaId)}`;
  }

  function abrirCambioResponsables(tarea, modo) {
    if (!validarPermisoTarea(tarea, modo === 'transferir' ? 'transferir esta actividad' : 'agregar apoyo')) return;
    const actuales = tecnicosAsignadosTarea(tarea).map(t => t.id);
    setModalResponsables({ tarea, modo });
    setResponsablesSeleccionados(modo === 'transferir' ? [] : actuales);
    setNotaCambioResponsables('');
  }

  function alternarResponsable(id) {
    setResponsablesSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function guardarCambioResponsables() {
    if (!modalResponsables || !usuarioActual) return;
    const { tarea, modo } = modalResponsables;
    if (!validarPermisoTarea(tarea, modo === 'transferir' ? 'transferir esta actividad' : 'agregar apoyo')) return;
    const ids = responsablesSeleccionados.filter(id => perfiles.find(p => p.id === id)?.rol === 'tecnico');
    if (ids.length === 0) {
      alert('Selecciona al menos a un técnico.');
      return;
    }
    setGuardandoResponsables(true);
    const ahora = new Date().toISOString();

    if (modo === 'transferir') {
      // Cierra los cronómetros actuales; el nuevo responsable inicia cuando realmente comience.
      await supabase.from('sesiones_tarea')
        .update({ fecha_fin: ahora, tipo_fin: 'relevo', notas: notaCambioResponsables || 'Actividad transferida' })
        .eq('tarea_id', tarea.id)
        .is('fecha_fin', null);
    }

    const actuales = tecnicosAsignadosTarea(tarea).map(t => t.id);
    const nuevos = modo === 'transferir' ? ids : Array.from(new Set([...actuales, ...ids]));
    const { error } = await supabase.from('tareas').update({
      tecnico_id: nuevos[0],
      tecnicos_ids: nuevos,
      estado: modo === 'transferir' ? ((tarea._sesiones || []).length > 0 ? 'en_proceso' : 'pendiente') : tarea.estado
    }).eq('id', tarea.id);

    if (!error) {
      const nombres = perfiles.filter(p => ids.includes(p.id)).map(p => p.nombre.split(' ')[0]).join(', ');
      await supabase.from('avances_tarea').insert({
        tarea_id: tarea.id,
        tecnico_id: usuarioActual.rol === 'tecnico' ? usuarioActual.id : (tarea.tecnico_id || ids[0]),
        porcentaje_avance: 0,
        notas_avance: `${modo === 'transferir' ? 'Transferencia/Reasignación a' : 'Apoyo agregado'}: ${nombres}${notaCambioResponsables ? `. ${notaCambioResponsables}` : ''}`,
        foto_avance: null
      });
    }

    setGuardandoResponsables(false);
    if (error) {
      alert(`No se pudo actualizar responsables: ${error.message}`);
      return;
    }
    setModalResponsables(null);
    setResponsablesSeleccionados([]);
    setNotaCambioResponsables('');
    await cargarTareas();
    alert(modo === 'transferir' ? 'Actividad transferida. El nuevo responsable deberá pulsar Continuar cuando empiece.' : 'Apoyo agregado correctamente.');
  }

  function tiemposPorTecnico(tarea) {
    const idsTecnicos = new Set(perfiles.filter(p => p.rol === 'tecnico').map(p => p.id));
    const acumulado = {};
    for (const sesion of (tarea?._sesiones || [])) {
      if (!idsTecnicos.has(sesion.tecnico_id)) continue;
      const inicio = new Date(sesion.fecha_inicio).getTime();
      const fin = sesion.fecha_fin ? new Date(sesion.fecha_fin).getTime() : ahoraReloj;
      const seg = Math.max(0, Math.floor((fin - inicio) / 1000));
      acumulado[sesion.tecnico_id] = (acumulado[sesion.tecnico_id] || 0) + seg;
    }
    return Object.entries(acumulado).map(([id, segundos]) => ({
      id,
      nombre: perfiles.find(p => p.id === id)?.nombre?.split(' ')[0] || 'Técnico',
      segundos
    }));
  }

  function duracionRealTarea(tarea) {
    const sesionesTecnicos = (tarea?._sesiones || []).filter(s => perfiles.find(p => p.id === s.tecnico_id)?.rol === 'tecnico');
    if (sesionesTecnicos.length === 0) return 0;
    const inicios = sesionesTecnicos.map(s => new Date(s.fecha_inicio).getTime()).filter(Number.isFinite);
    const inicio = Math.min(...inicios);
    const fin = tarea?.fecha_fin
      ? new Date(tarea.fecha_fin).getTime()
      : tarea?.fecha_completada
        ? new Date(tarea.fecha_completada).getTime()
        : ahoraReloj;
    return Math.max(0, Math.floor((fin - inicio) / 1000));
  }

  function abrirInicio(tarea) {
    if (!validarPermisoTarea(tarea, 'iniciar o continuar esta actividad')) return;
    setModalInicio(tarea);
    setNotasInicio('');
    setFotoInicio(tarea.estado === 'pendiente' || tarea.estado === 'bloqueada' ? (tarea.foto_antes || null) : null);
    if (tarea.estado === 'pendiente' || tarea.estado === 'bloqueada') {
      setTecnicosInicio(tecnicosAsignadosTarea(tarea).map(t => t.id));
    } else if (usuarioActual?.rol === 'tecnico') {
      setTecnicosInicio([usuarioActual.id]);
    } else {
      setTecnicosInicio([]);
    }
  }

  function alternarTecnicoInicio(id) {
    setTecnicosInicio(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function abrirHistorial(tarea) {
    setCargandoHistorial(true);
    setModalHistorial({ tarea, sesiones: [], avances: [], bloqueos: [], fotos: [] });
    const [sesionesR, avancesR, bloqueosR, fotosR] = await Promise.all([
      supabase.from('sesiones_tarea').select('*').eq('tarea_id', tarea.id).order('fecha_inicio', { ascending: true }),
      supabase.from('avances_tarea').select('*').eq('tarea_id', tarea.id),
      supabase.from('bloqueos_tarea').select('*').eq('tarea_id', tarea.id),
      supabase.from('fotos_tarea').select('*').eq('tarea_id', tarea.id)
    ]);
    setModalHistorial({
      tarea,
      sesiones: sesionesR.data || [],
      avances: avancesR.data || [],
      bloqueos: bloqueosR.data || [],
      fotos: fotosR.data || []
    });
    setCargandoHistorial(false);
  }

  async function pausarTiempo(tarea) {
    if (!usuarioActual) return;
    if (!validarPermisoTarea(tarea, 'pausar tiempo en esta actividad')) return;
    const activa = sesionActivaDeUsuario(tarea);
    if (!activa) {
      alert('No tienes un cronómetro activo en esta actividad.');
      return;
    }

    const motivo = window.prompt('Motivo de la pausa (por ejemplo: comida, descanso o espera breve):', 'Comida');
    if (motivo === null) return;

    const { error } = await supabase
      .from('sesiones_tarea')
      .update({
        fecha_fin: new Date().toISOString(),
        tipo_fin: 'pausa',
        notas: motivo.trim() || 'Pausa'
      })
      .eq('id', activa.id);

    if (error) {
      alert(`No se pudo pausar el tiempo: ${error.message}`);
      return;
    }

    await cargarTareas();
    alert('Tiempo pausado. Cuando regreses, pulsa “Continuar / iniciar turno”.');
  }

  async function guardarFotoHistorial(tareaId, tipo, foto, comentario = '') {
    if (!foto || !usuarioActual) return;

    const { error } = await supabase.from('fotos_tarea').insert({
      tarea_id: tareaId,
      tecnico_id: usuarioActual.id,
      tipo,
      url: foto,
      comentario: comentario || null
    });

    if (error) {
      console.error('Error guardando foto en historial:', error);
    }
  }

  async function cerrarSesionActiva(tareaId, tipoFin, notas = '') {
    if (!usuarioActual) return;

    const { data: sesiones, error: errorBusqueda } = await supabase
      .from('sesiones_tarea')
      .select('id')
      .eq('tarea_id', tareaId)
      .eq('tecnico_id', usuarioActual.id)
      .is('fecha_fin', null)
      .order('fecha_inicio', { ascending: false })
      .limit(1);

    if (errorBusqueda) {
      console.error('Error buscando sesión activa:', errorBusqueda);
      return;
    }

    if (sesiones && sesiones.length > 0) {
      await supabase
        .from('sesiones_tarea')
        .update({
          fecha_fin: new Date().toISOString(),
          tipo_fin: tipoFin,
          notas: notas || null
        })
        .eq('id', sesiones[0].id);
    }
  }

  async function guardarInicioActividad() {
    if (!modalInicio || !usuarioActual) return;
    setGuardandoInicio(true);

    const ahora = new Date().toISOString();
    const esInicioEquipo = modalInicio.estado === 'pendiente' || modalInicio.estado === 'bloqueada';

    let idsAIniciar = [];
    if (esInicioEquipo) {
      idsAIniciar = tecnicosInicio.filter(id => perfiles.find(p => p.id === id)?.rol === 'tecnico');
      if (idsAIniciar.length === 0) {
        setGuardandoInicio(false);
        alert('Selecciona al menos a un técnico que vaya a participar.');
        return;
      }
    } else {
      if (usuarioActual.rol !== 'tecnico') {
        setGuardandoInicio(false);
        alert('Como administrador puedes revisar la actividad, pero tu tiempo no se registra.');
        return;
      }
      idsAIniciar = [usuarioActual.id];
    }

    const datosTarea = {
      estado: 'en_proceso',
      notas_inicio: notasInicio || modalInicio.notas_inicio || null
    };

    if (!modalInicio.fecha_inicio) datosTarea.fecha_inicio = ahora;
    if (!modalInicio.iniciado_por) datosTarea.iniciado_por = idsAIniciar[0] || null;
    if (fotoInicio) datosTarea.foto_antes = fotoInicio;

    const { error: errorTarea } = await supabase
      .from('tareas')
      .update(datosTarea)
      .eq('id', modalInicio.id);

    if (errorTarea) {
      setGuardandoInicio(false);
      alert(`No se pudo iniciar la actividad: ${errorTarea.message}`);
      return;
    }

    const { data: abiertas, error: errorAbiertas } = await supabase
      .from('sesiones_tarea')
      .select('tecnico_id')
      .eq('tarea_id', modalInicio.id)
      .is('fecha_fin', null);

    if (errorAbiertas) {
      setGuardandoInicio(false);
      alert(`La actividad cambió a En proceso, pero no se pudieron revisar los cronómetros: ${errorAbiertas.message}`);
      await cargarTareas();
      return;
    }

    const abiertos = new Set((abiertas || []).map(s => s.tecnico_id));
    const nuevasSesiones = idsAIniciar
      .filter(id => !abiertos.has(id))
      .map(id => ({
        tarea_id: modalInicio.id,
        tecnico_id: id,
        fecha_inicio: ahora,
        notas: esInicioEquipo ? (notasInicio || 'Inicio de equipo') : (notasInicio || 'Continuación individual')
      }));

    if (nuevasSesiones.length > 0) {
      const { error: errorSesion } = await supabase.from('sesiones_tarea').insert(nuevasSesiones);
      if (errorSesion) {
        setGuardandoInicio(false);
        alert(`La actividad inició, pero no se pudieron abrir todos los cronómetros: ${errorSesion.message}`);
        await cargarTareas();
        return;
      }
    }

    if (fotoInicio) {
      // La evidencia pertenece a la orden; si inicia el admin, se guarda sin convertirlo en tiempo de trabajo.
      const tecnicoFoto = usuarioActual.rol === 'tecnico' ? usuarioActual.id : (idsAIniciar[0] || null);
      const { error: errorFoto } = await supabase.from('fotos_tarea').insert({
        tarea_id: modalInicio.id,
        tecnico_id: tecnicoFoto,
        tipo: 'antes',
        url: fotoInicio,
        comentario: notasInicio || null
      });
      if (errorFoto) console.error('Error guardando foto inicial:', errorFoto);
    }

    setGuardandoInicio(false);
    setModalInicio(null);
    setNotasInicio('');
    setFotoInicio(null);
    setTecnicosInicio([]);
    await cargarTareas();
    alert(esInicioEquipo ? 'Actividad iniciada. Se abrió el tiempo para el equipo seleccionado.' : 'Tu tiempo volvió a iniciar.');
  }

  async function cancelarTarea(tarea) {
    if (usuarioActual?.rol !== 'admin') return;

    const motivo = window.prompt('Motivo de cancelación de la actividad:');
    if (motivo === null) return;
    if (!motivo.trim()) {
      alert('Escribe un motivo de cancelación.');
      return;
    }

    if (!window.confirm(`¿Cancelar la actividad "${tarea.titulo}"? El registro se conservará.`)) return;

    const ahora = new Date().toISOString();

    await supabase
      .from('sesiones_tarea')
      .update({ fecha_fin: ahora, tipo_fin: 'cancelada' })
      .eq('tarea_id', tarea.id)
      .is('fecha_fin', null);

    const { error } = await supabase
      .from('tareas')
      .update({
        estado: 'cancelada',
        cancelado_por: usuarioActual.id,
        fecha_cancelacion: ahora,
        motivo_cancelacion: motivo.trim()
      })
      .eq('id', tarea.id);

    if (error) {
      alert(`No se pudo cancelar: ${error.message}`);
      return;
    }

    cargarTareas();
  }

  async function eliminarTarea(tarea) {
    if (usuarioActual?.rol !== 'admin') return;

    const texto = `ELIMINAR`;
    const confirmacion = window.prompt(
      `Esta acción borra definitivamente la actividad "${tarea.titulo}" y sus avances.\n\nEscribe ${texto} para confirmar:`
    );

    if (confirmacion !== texto) return;

    // Se eliminan hijos primero para evitar problemas si alguna relación antigua no tiene CASCADE.
    await supabase.from('fotos_tarea').delete().eq('tarea_id', tarea.id);
    await supabase.from('sesiones_tarea').delete().eq('tarea_id', tarea.id);
    await supabase.from('avances_tarea').delete().eq('tarea_id', tarea.id);
    await supabase.from('bloqueos_tarea').delete().eq('tarea_id', tarea.id);

    const { error } = await supabase.from('tareas').delete().eq('id', tarea.id);

    if (error) {
      alert(`No se pudo eliminar la actividad: ${error.message}`);
      return;
    }

    cargarTareas();
    alert('Actividad eliminada definitivamente.');
  }

  async function guardarCierreTarea() {
    if (!modalTerminar || !usuarioActual) return;
    if (!validarPermisoTarea(modalTerminar, 'terminar esta actividad')) return;
    setGuardandoCierre(true);

    const ahora = new Date().toISOString();

    // Al concluir una orden se cierran todas las sesiones que hayan quedado abiertas.
    await supabase
      .from('sesiones_tarea')
      .update({ fecha_fin: ahora, tipo_fin: 'completada' })
      .eq('tarea_id', modalTerminar.id)
      .is('fecha_fin', null);

    const { error } = await supabase
      .from('tareas')
      .update({ 
        estado: 'completada', 
        fecha_completada: ahora,
        fecha_fin: ahora,
        finalizado_por: usuarioActual.id,
        notas_cierre: notasCierre,
        foto_antes: fotoAntes || modalTerminar.foto_antes || null,
        foto_despues: fotoDespues,
        descripcion: `${modalTerminar.descripcion ? modalTerminar.descripcion + '\n' : ''}[Concluida por ${usuarioActual.nombre.split(' ')[0]}]: ${notasCierre || 'Trabajo terminado'}`
      })
      .eq('id', modalTerminar.id);

    if (fotoDespues) {
      await guardarFotoHistorial(modalTerminar.id, 'despues', fotoDespues, notasCierre);
    }

    setGuardandoCierre(false);
    if (!error) {
      setModalTerminar(null);
      setNotasCierre('');
      setFotoAntes(null);
      setFotoDespues(null);
      cargarTareas();
      alert('¡Tarea completada con éxito!');
    } else {
      alert(`No se pudo concluir la actividad: ${error.message}`);
    }
  }

  async function guardarAvanceTurno() {
    if (!modalAvance || !notaAvance || !usuarioActual) return;
    if (!validarPermisoTarea(modalAvance, 'registrar un avance en esta actividad')) return;
    setGuardandoAvance(true);

    await supabase.from('avances_tarea').insert({
      tarea_id: modalAvance.id,
      tecnico_id: usuarioActual.id,
      porcentaje_avance: porcentajeAvance,
      notas_avance: notaAvance,
      foto_avance: fotoAvance
    });

    if (fotoAvance) {
      await guardarFotoHistorial(modalAvance.id, 'proceso', fotoAvance, notaAvance);
    }

    await cerrarSesionActiva(modalAvance.id, 'relevo', notaAvance);

    const nuevosAsignados = reasignarA 
      ? Array.from(new Set([...(modalAvance.tecnicos_ids || []), reasignarA]))
      : modalAvance.tecnicos_ids;

    const { error } = await supabase.from('tareas').update({
      estado: 'en_proceso',
      tecnicos_ids: nuevosAsignados,
      descripcion: `${modalAvance.descripcion ? modalAvance.descripcion + '\n' : ''}[Avance ${usuarioActual.nombre.split(' ')[0]} ${porcentajeAvance}%]: ${notaAvance}`
    }).eq('id', modalAvance.id);

    setGuardandoAvance(false);
    if (!error) {
      setModalAvance(null);
      setNotaAvance('');
      setFotoAvance(null);
      setReasignarA('');
      cargarTareas();
      alert('Avance guardado. Tu sesión de trabajo quedó cerrada para permitir el relevo.');
    } else {
      alert(`No se pudo guardar el avance: ${error.message}`);
    }
  }

  async function guardarBloqueo() {
    if (!modalBloqueo || !usuarioActual) return;

    await supabase.from('bloqueos_tarea').insert({
      tarea_id: modalBloqueo.id,
      motivo: motivoBloqueo,
      detalle: detalleBloqueo
    });

    await cerrarSesionActiva(modalBloqueo.id, 'bloqueo', detalleBloqueo);

    const { error } = await supabase
      .from('tareas')
      .update({ estado: 'bloqueada' })
      .eq('id', modalBloqueo.id);

    setModalBloqueo(null);
    setDetalleBloqueo('');

    if (error) {
      alert(`No se pudo bloquear la actividad: ${error.message}`);
      return;
    }

    cargarTareas();
  }

  function formatearFechaAgenda(fechaStr) {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    }).format(new Date(y, m - 1, d));
  }

  function enviarAgendaHoyWhatsApp() {
    const hoy = new Date().toISOString().split('T')[0];

    const actividadesHoy = tareas
      .filter(t =>
        t.fecha_programada === hoy &&
        t.estado !== 'completada' &&
        t.estado !== 'cancelada'
      )
      .sort((a, b) => {
        const ha = a.hora_programada || '99:99:99';
        const hb = b.hora_programada || '99:99:99';
        return ha.localeCompare(hb);
      });

    if (actividadesHoy.length === 0) {
      alert('No hay actividades pendientes programadas para hoy.');
      return;
    }

    const lineas = actividadesHoy.map((t, index) => {
      const nombres = perfiles
        .filter(p => t.tecnicos_ids?.includes(p.id) || p.id === t.tecnico_id)
        .map(p => p.nombre.split(' ')[0])
        .join(' + ') || 'Sin asignar';

      const hora = t.hora_programada
        ? `🕐 ${String(t.hora_programada).slice(0, 5)}`
        : '🕐 Sin hora específica';

      return (
        `*${index + 1}. ${t.titulo}*\n` +
        `${hora}\n` +
        `📍 ${t.ubicacion}\n` +
        `👥 ${nombres}` +
        (t.descripcion ? `\n📝 ${t.descripcion}` : '') +
        `\n📲 ${enlaceTarea(t.id)}`
      );
    });

    const mensaje = encodeURIComponent(
      `🛠️ *ACTIVIDADES PROGRAMADAS DE HOY*\n` +
      `📅 ${formatearFechaAgenda(hoy)}\n\n` +
      lineas.join('\n\n') +
      `\n\n📲 *Abrir Control de Mantenimiento:*\nhttps://mnttocapsec.vercel.app`
    );

    // Sin API de pago: WhatsApp abre el selector y el administrador elige el grupo interno.
    window.open(`https://api.whatsapp.com/send?text=${mensaje}`, '_blank');
  }

  async function crearTareaProgramada(e) {
    e.preventDefault();
    const accion = e.nativeEvent?.submitter?.value || 'guardar';
    const notificarAhora = accion === 'guardar_notificar';
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
        fecha_programada: d.toISOString().split('T')[0],
        hora_programada: nuevaTarea.hora_programada || null,
        foto_antes: nuevaTarea.foto || null
      });
    }

    const { data: tareasCreadas, error } = await supabase.from('tareas').insert(registrosParaInsertar).select('*');

    if (!error) {
      // Si el administrador adjuntó una imagen al programar, conservarla también
      // en el historial de evidencias de cada orden creada.
      if (nuevaTarea.foto && tareasCreadas?.length) {
        const evidencias = tareasCreadas.map(tareaCreada => ({
          tarea_id: tareaCreada.id,
          tecnico_id: usuarioActual?.id || null,
          tipo: 'antes',
          url: nuevaTarea.foto,
          comentario: 'Evidencia / referencia adjunta al programar la actividad'
        }));
        const { error: errorFotosProgramadas } = await supabase.from('fotos_tarea').insert(evidencias);
        if (errorFotosProgramadas) console.error('No se pudo guardar la evidencia programada en el historial:', errorFotosProgramadas);
      }

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
        (nuevaTarea.hora_programada ? `🕐 *Hora aproximada:* ${nuevaTarea.hora_programada}\n` : '') +
        (nuevaTarea.descripcion ? `📝 *Detalle:* ${nuevaTarea.descripcion}\n` : '') +
        (nuevaTarea.foto ? `📷 *Cuenta con imagen de referencia en la app*\n` : '') +
        `\n📲 *Ver actividad:* ${tareasCreadas?.length === 1 ? enlaceTarea(tareasCreadas[0].id) : window.location.origin}`
      );

      setNuevaTarea({ 
        titulo: '', 
        descripcion: '', 
        ubicacion: '', 
        prioridad: 'media', 
        fecha_programada: hoyStr,
        hora_programada: '',
        fecha_fin: hoyStr,
        es_recurrente: false,
        tecnicos_seleccionados: [],
        foto: null
      });
      cargarTareas();

      if (notificarAhora) {
        const tecnicosSeleccionados = perfiles.filter(p => nuevaTarea.tecnicos_seleccionados.includes(p.id));

        if (tecnicosSeleccionados.length === 1 && tecnicosSeleccionados[0].telefono) {
          const telefonoLimpio = tecnicosSeleccionados[0].telefono.replace(/\D/g, '');
          const telefonoMexico = telefonoLimpio.startsWith('52') ? telefonoLimpio : `52${telefonoLimpio}`;
          window.open(`https://wa.me/${telefonoMexico}?text=${mensajeWhatsApp}`, '_blank');
        } else {
          // Para equipos de varias personas se abre el selector para elegir el grupo/chat interno.
          window.open(`https://api.whatsapp.com/send?text=${mensajeWhatsApp}`, '_blank');
        }
      } else {
        alert('Actividad guardada. No se envió aviso por WhatsApp.');
      }
    }
  }

  async function guardarTareaExpres(notificarAhora = false) {
    if (!tareaExpres.ubicacion || !tareaExpres.descripcion || !usuarioActual) {
      alert('Indica la ubicación y qué se encontró o realizó.');
      return;
    }

    let tecnicosAsignadosIds = Array.from(new Set(tareaExpres.tecnicos_seleccionados || []))
      .filter(id => perfiles.find(p => p.id === id)?.rol === 'tecnico');

    // Si lo crea un técnico, él queda incluido por defecto, pero puede agregar compañeros.
    if (usuarioActual.rol === 'tecnico' && !tecnicosAsignadosIds.includes(usuarioActual.id)) {
      tecnicosAsignadosIds.unshift(usuarioActual.id);
    }

    // Una atención ya resuelta por un técnico queda atribuida a quien la registró.
    if (tareaExpres.yaResuelto && usuarioActual.rol === 'tecnico' && tecnicosAsignadosIds.length === 0) {
      tecnicosAsignadosIds = [usuarioActual.id];
    }

    if (!tareaExpres.yaResuelto && tecnicosAsignadosIds.length === 0) {
      alert('Selecciona al menos a un técnico responsable.');
      return;
    }

    const tecnicoAsignadoId = tecnicosAsignadosIds[0] || (usuarioActual.rol === 'tecnico' ? usuarioActual.id : null);

    const fechaProgramada = tareaExpres.yaResuelto
      ? hoyStr
      : (tareaExpres.tipoAtencion === 'programar' ? (tareaExpres.fechaProgramada || hoyStr) : hoyStr);

    const prioridad = tareaExpres.tipoAtencion === 'urgente'
      ? 'alta'
      : tareaExpres.tipoAtencion === 'hoy'
      ? 'media'
      : 'baja';

    const ahoraIso = new Date().toISOString();
    setGuardandoExpres(true);

    const registro = {
      titulo: tareaExpres.yaResuelto
        ? `Atención rápida: ${tareaExpres.descripcion.slice(0, 42)}${tareaExpres.descripcion.length > 42 ? '...' : ''}`
        : `Hallazgo: ${tareaExpres.descripcion.slice(0, 42)}${tareaExpres.descripcion.length > 42 ? '...' : ''}`,
      descripcion: tareaExpres.descripcion,
      ubicacion: tareaExpres.ubicacion,
      prioridad,
      tipo_origen: 'en_recorrido',
      estado: tareaExpres.yaResuelto ? 'completada' : 'pendiente',
      tecnico_id: tecnicoAsignadoId,
      tecnicos_ids: tecnicosAsignadosIds,
      creado_por: usuarioActual.id,
      fecha_programada: fechaProgramada,
      fecha_completada: tareaExpres.yaResuelto ? ahoraIso : null,
      fecha_inicio: tareaExpres.yaResuelto ? ahoraIso : null,
      fecha_fin: tareaExpres.yaResuelto ? ahoraIso : null,
      finalizado_por: tareaExpres.yaResuelto ? usuarioActual.id : null,
      notas_cierre: tareaExpres.yaResuelto ? 'Atención registrada durante recorrido.' : null,
      foto_antes: !tareaExpres.yaResuelto ? tareaExpres.foto : null,
      foto_despues: tareaExpres.yaResuelto ? tareaExpres.foto : null
    };

    const { data: creada, error } = await supabase
      .from('tareas')
      .insert(registro)
      .select('*')
      .single();

    if (error) {
      setGuardandoExpres(false);
      alert(`No se pudo guardar el reporte: ${error.message}`);
      return;
    }

    if (tareaExpres.foto && creada?.id) {
      const tipoFoto = tareaExpres.yaResuelto ? 'despues' : 'antes';
      const { error: errorFoto } = await supabase.from('fotos_tarea').insert({
        tarea_id: creada.id,
        tecnico_id: usuarioActual.rol === 'tecnico' ? usuarioActual.id : tecnicoAsignadoId,
        tipo: tipoFoto,
        url: tareaExpres.foto,
        comentario: tareaExpres.yaResuelto
          ? 'Evidencia de atención rápida'
          : 'Evidencia inicial del hallazgo'
      });
      if (errorFoto) console.error('No se pudo guardar la foto en el historial:', errorFoto);
    }

    const responsable = tecnicosAsignadosIds.length
      ? perfiles.filter(p => tecnicosAsignadosIds.includes(p.id)).map(p => p.nombre.split(' ')[0]).join(' + ')
      : 'Sin asignar';

    const etiquetaAtencion = tareaExpres.yaResuelto
      ? 'Resuelta en recorrido'
      : tareaExpres.tipoAtencion === 'urgente'
      ? 'URGENTE'
      : tareaExpres.tipoAtencion === 'hoy'
      ? 'Atender hoy'
      : `Programada para ${fechaProgramada}`;

    const mensajeWhatsApp = encodeURIComponent(
      `🚶 *REPORTE EN RECORRIDO*\n\n` +
      `📍 *Ubicación:* ${tareaExpres.ubicacion}\n` +
      `📝 *Detalle:* ${tareaExpres.descripcion}\n` +
      `⚡ *Atención:* ${etiquetaAtencion}\n` +
      `👤 *Responsable:* ${responsable}\n` +
      (tareaExpres.foto ? `📷 *Cuenta con evidencia fotográfica en la app*\n` : '') +
      `\n📲 *Ver actividad:* ${creada?.id ? enlaceTarea(creada.id) : window.location.origin}`
    );

    setGuardandoExpres(false);
    setModalExpres(false);
    setTareaExpres({
      ubicacion: '',
      descripcion: '',
      yaResuelto: true,
      foto: null,
      tipoAtencion: 'hoy',
      fechaProgramada: hoyStr,
      asignadoA: '',
      tecnicos_seleccionados: []
    });
    await cargarTareas();

    if (notificarAhora) {
      window.open(`https://api.whatsapp.com/send?text=${mensajeWhatsApp}`, '_blank');
    } else {
      alert(tareaExpres.yaResuelto ? 'Atención rápida registrada.' : 'Hallazgo guardado en la app.');
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

    const esFutura = Boolean(t.fecha_programada && t.fecha_programada > hoyStr);
    const tieneTecnicoTrabajando = (t._sesiones || []).some(s => {
      const perfil = perfiles.find(p => p.id === s.tecnico_id);
      return perfil?.rol === 'tecnico' && !s.fecha_fin;
    });

    // Pendientes = ya corresponde atenderlas. Las futuras se consultan en Próximas.
    if (filtroEstado === 'pendientes') return t.estado === 'pendiente' && !esFutura;
    // En curso = alguien está contabilizando tiempo en este momento.
    if (filtroEstado === 'en_curso') return tieneTecnicoTrabajando;
    // En proceso / relevos = la orden ya fue iniciada aunque en este instante esté pausada.
    if (filtroEstado === 'en_proceso') return t.estado === 'en_proceso';
    // Próximas = órdenes aún no concluidas cuya fecha todavía no llega.
    if (filtroEstado === 'proximas') return esFutura && !['completada', 'cancelada'].includes(t.estado);
    if (filtroEstado === 'bloqueadas') return t.estado === 'bloqueada';
    if (filtroEstado === 'completadas') return t.estado === 'completada';
    if (filtroEstado === 'canceladas') return t.estado === 'cancelada';
    return true;
  });

  const fechaActual = new Date();
  const hoyReporteStr = fechaActual.toISOString().split('T')[0];

  function fechaLocalDesdeISO(fechaStr) {
    const [y, m, d] = String(fechaStr || hoyReporteStr).split('-').map(Number);
    const fecha = new Date(y, (m || 1) - 1, d || 1);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  function isoFechaLocal(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const referenciaReporte = fechaLocalDesdeISO(fechaReferenciaReporte);
  const numeroSemana = obtenerNumeroSemana(referenciaReporte);

  function limitesPeriodoReporte() {
    const ref = new Date(referenciaReporte);
    let inicio;
    let fin;

    if (tipoPeriodoReporte === 'semanal') {
      const dia = ref.getDay();
      const ajusteLunes = dia === 0 ? -6 : 1 - dia;
      inicio = new Date(ref);
      inicio.setDate(ref.getDate() + ajusteLunes);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
    } else if (tipoPeriodoReporte === 'quincenal') {
      const esPrimera = ref.getDate() <= 15;
      inicio = new Date(ref.getFullYear(), ref.getMonth(), esPrimera ? 1 : 16);
      fin = esPrimera
        ? new Date(ref.getFullYear(), ref.getMonth(), 15)
        : new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    } else {
      inicio = new Date(ref.getFullYear(), ref.getMonth(), 1);
      fin = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    }

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin };
  }

  const { inicio: inicioPeriodoReporte, fin: finPeriodoReporte } = limitesPeriodoReporte();

  const tareasReporte = tareas.filter(t => {
    if (t.estado === 'cancelada') return false;

    // Las actividades futuras no afectan el desempeño antes de que llegue su fecha.
    if (t.estado !== 'completada' && t.fecha_programada > hoyReporteStr) return false;

    const fechaBase = t.estado === 'completada' && t.fecha_completada
      ? new Date(t.fecha_completada)
      : fechaLocalDesdeISO(t.fecha_programada);

    return fechaBase >= inicioPeriodoReporte && fechaBase <= finPeriodoReporte;
  });

  const totalCompletadasRep = tareasReporte.filter(t => t.estado === 'completada').length;
  const totalExpresRep = tareasReporte.filter(t => t.tipo_origen === 'en_recorrido').length;
  const totalBloqueadasRep = tareasReporte.filter(t => t.estado === 'bloqueada').length;
  const totalPendientesRep = tareasReporte.filter(t => ['pendiente', 'en_proceso', 'bloqueada'].includes(t.estado)).length;

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
        data: tecnicosLista.map(t => tareasReporte.filter(tar => (tar.tecnico_id === t.id || tar.tecnicos_ids?.includes(t.id)) && ['pendiente', 'en_proceso', 'bloqueada'].includes(tar.estado)).length),
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
  const formatoCorto = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  const etiquetaPeriodo = tipoPeriodoReporte === 'semanal'
    ? `Reporte Semanal • Semana ${numeroSemana} • ${formatoCorto.format(inicioPeriodoReporte)} al ${formatoCorto.format(finPeriodoReporte)}`
    : tipoPeriodoReporte === 'quincenal'
    ? `Reporte Quincenal • ${formatoCorto.format(inicioPeriodoReporte)} al ${formatoCorto.format(finPeriodoReporte)}`
    : `Reporte Mensual • ${meses[referenciaReporte.getMonth()]} ${referenciaReporte.getFullYear()}`;

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

            <button
              onClick={() => cargarTareas(true)}
              disabled={actualizando}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              title={ultimoActualizado ? `Última actualización: ${ultimoActualizado.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})}` : 'Actualizar'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actualizando ? 'animate-spin' : ''}`} /> Actualizar
            </button>

            {!esStandalone && installPrompt && (
              <button
                onClick={instalarApp}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                title="Instalar acceso directo de la app"
              >
                <Download className="w-3.5 h-3.5" /> Instalar app
              </button>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" /> Asignar / Programar Orden de Trabajo
                  </h2>
                  <button
                    type="button"
                    onClick={enviarAgendaHoyWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-4 h-4" /> Enviar lo programado hoy
                  </button>
                </div>
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
                    <label className="font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Hora aproximada (opcional)
                    </label>
                    <input
                      type="time"
                      value={nuevaTarea.hora_programada}
                      onChange={e => setNuevaTarea({...nuevaTarea, hora_programada: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Solo referencia operativa; no se usa para evaluar puntualidad.</p>
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

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">Foto / imagen de referencia (opcional)</label>
                    <p className="text-[10px] text-slate-400 mb-2">Puedes tomar una foto en el momento o subir una imagen que hayas recibido por correo, WhatsApp u otro medio.</p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                      {nuevaTarea.foto && (
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => setFotoAmpliada({ src: nuevaTarea.foto, titulo: 'Imagen de referencia de la actividad' })}
                            className="relative shrink-0"
                          >
                            <img src={nuevaTarea.foto} alt="Referencia" className="w-28 h-24 object-cover rounded-lg border cursor-zoom-in" />
                            <Maximize2 className="absolute bottom-1 right-1 w-4 h-4 p-0.5 rounded bg-black/60 text-white" />
                          </button>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-500">Esta imagen quedará asociada como evidencia inicial / referencia.</p>
                            <button
                              type="button"
                              onClick={() => setNuevaTarea(prev => ({...prev, foto: null}))}
                              className="mt-2 text-[10px] font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Quitar imagen
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <label className="cursor-pointer border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg p-2.5 flex items-center justify-center gap-1.5 font-semibold">
                          <Camera className="w-4 h-4" /> Tomar foto
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={e => procesarFoto(e, foto => setNuevaTarea(prev => ({...prev, foto})))}
                          />
                        </label>
                        <label className="cursor-pointer border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg p-2.5 flex items-center justify-center gap-1.5 font-semibold">
                          <FileText className="w-4 h-4" /> Subir imagen
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => procesarFoto(e, foto => setNuevaTarea(prev => ({...prev, foto})))}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="submit"
                      value="guardar"
                      className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Guardar sin notificar
                    </button>
                    <button
                      type="submit"
                      value="guardar_notificar"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Guardar y notificar ahora
                    </button>
                  </div>
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
                          t.estado === 'en_proceso' ? 'border-blue-200 bg-blue-50/20' :
                          t.estado === 'cancelada' ? 'border-orange-200 bg-orange-50/20' : 'border-slate-200'
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
                              📅 {t.fecha_programada}{t.hora_programada ? ` • 🕐 ${String(t.hora_programada).slice(0, 5)}` : ''}
                            </span>
                          </div>

                          {t._sesiones?.length > 0 && tiemposPorTecnico(t).length > 0 && (
                            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duración de la actividad</span>
                                <span className="font-bold text-slate-700">{formatearDuracion(duracionRealTarea(t))}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-700 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Tiempo efectivo del equipo</span>
                                <span className="font-bold text-blue-700">{formatearDuracion(tiemposPorTecnico(t).reduce((a, x) => a + x.segundos, 0))} persona</span>
                              </div>
                              {usuarioActual.rol === 'admin' && (
                                <div className="mt-1 text-slate-500">
                                  {tiemposPorTecnico(t).map(x => `${x.nombre}: ${formatearDuracion(x.segundos)}`).join(' • ')}
                                </div>
                              )}
                              {sesionActivaDeUsuario(t) && (
                                <div className="mt-1 font-semibold text-emerald-700">● Tu cronómetro está corriendo</div>
                              )}
                            </div>
                          )}

                          {t.estado === 'completada' && (t.foto_antes || t.foto_despues) && (
                            <div className="flex gap-3 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                              {t.foto_antes && (
                                <div className="text-[10px] text-slate-500 text-center">
                                  <span className="block mb-0.5">Antes</span>
                                  <button type="button" onClick={() => setFotoAmpliada({ src: t.foto_antes, titulo: `Antes • ${t.titulo}` })} className="relative group"><img src={t.foto_antes} alt="Antes" className="w-20 h-20 object-cover rounded-lg border shadow-xs cursor-zoom-in" /><Maximize2 className="absolute bottom-1 right-1 w-4 h-4 p-0.5 rounded bg-black/60 text-white opacity-80" /></button>
                                </div>
                              )}
                              {t.foto_despues && (
                                <div className="text-[10px] text-slate-500 text-center">
                                  <span className="block mb-0.5">Después</span>
                                  <button type="button" onClick={() => setFotoAmpliada({ src: t.foto_despues, titulo: `Después • ${t.titulo}` })} className="relative group"><img src={t.foto_despues} alt="Después" className="w-20 h-20 object-cover rounded-lg border shadow-xs cursor-zoom-in" /><Maximize2 className="absolute bottom-1 right-1 w-4 h-4 p-0.5 rounded bg-black/60 text-white opacity-80" /></button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {t.estado !== 'completada' && t.estado !== 'cancelada' && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            {(t.estado === 'pendiente' || t.estado === 'bloqueada') &&
                              (usuarioActual.rol === 'admin' || t.tecnicos_ids?.includes(usuarioActual.id) || t.tecnico_id === usuarioActual.id) && (
                              <button
                                onClick={() => abrirInicio(t)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                              >
                                {t.estado === 'bloqueada' ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {t.estado === 'bloqueada' ? ' Reanudar equipo' : ' Iniciar actividad'}
                              </button>
                            )}

                            {t.estado === 'en_proceso' && puedeModificarTarea(t) && (
                              <>
                                {usuarioActual.rol === 'tecnico' && (
                                  !sesionActivaDeUsuario(t) ? (
                                    <button
                                      onClick={() => abrirInicio(t)}
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                    >
                                      <Play className="w-4 h-4" /> Continuar mi tiempo
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => pausarTiempo(t)}
                                      className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                    >
                                      <Pause className="w-4 h-4" /> Pausar mi tiempo
                                    </button>
                                  )
                                )}

                                <button 
                                  onClick={() => {
                                    setModalTerminar(t);
                                    setNotasCierre('');
                                    setFotoAntes(t.foto_antes || null);
                                    setFotoDespues(null);
                                  }}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Terminar para todos
                                </button>

                                {usuarioActual.rol === 'tecnico' && sesionActivaDeUsuario(t) && (
                                  <button 
                                    onClick={() => {
                                      setModalAvance(t);
                                      setFotoAvance(null);
                                      setNotaAvance('');
                                    }}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                  >
                                    <MessageSquareShare className="w-4 h-4" /> Avance / Relevo
                                  </button>
                                )}

                                <button 
                                  onClick={() => setModalBloqueo(t)}
                                  title="Bloquear actividad por material, proveedor o apoyo"
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition"
                                >
                                  <AlertTriangle className="w-4 h-4" /> Bloquear
                                </button>
                              </>
                            )}

                            {puedeModificarTarea(t) && (
                              <>
                                <button
                                  onClick={() => abrirCambioResponsables(t, 'apoyo')}
                                  className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                >
                                  <UserPlus className="w-4 h-4" /> Agregar apoyo
                                </button>
                                <button
                                  onClick={() => abrirCambioResponsables(t, 'transferir')}
                                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                >
                                  <ArrowRightLeft className="w-4 h-4" /> Transferir
                                </button>
                              </>
                            )}

                            {usuarioActual.rol === 'admin' && (
                              <>
                                <button
                                  onClick={() => cancelarTarea(t)}
                                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                >
                                  <Ban className="w-4 h-4" /> Cancelar
                                </button>
                                <button
                                  onClick={() => eliminarTarea(t)}
                                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                                >
                                  <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {t.estado === 'cancelada' && (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="text-[11px] text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <strong>Actividad cancelada.</strong> {t.motivo_cancelacion || 'Sin motivo registrado.'}
                            </div>
                            {usuarioActual.rol === 'admin' && (
                              <button
                                onClick={() => eliminarTarea(t)}
                                className="mt-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar definitivamente
                              </button>
                            )}
                          </div>
                        )}


                        {(usuarioActual.rol === 'admin' || estaAsignadoATarea(t)) && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 print:hidden">
                          <button
                            onClick={() => abrirHistorial(t)}
                            className="mt-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition print:hidden"
                          >
                            <Eye className="w-4 h-4" /> Ver detalle / historial
                          </button>
                          <button
                            onClick={async () => {
                              const url = enlaceTarea(t.id);
                              try { await navigator.clipboard.writeText(url); alert('Enlace de la actividad copiado.'); }
                              catch { window.prompt('Copia este enlace:', url); }
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                          >
                            <Link2 className="w-4 h-4" /> Copiar enlace
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

                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-slate-400 font-bold leading-none mb-1">Periodo de referencia</p>
                    <input
                      type="date"
                      value={fechaReferenciaReporte}
                      onChange={e => setFechaReferenciaReporte(e.target.value)}
                      className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFechaReferenciaReporte(hoyReporteStr)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-1"
                    title="Volver al periodo actual"
                  >
                    Hoy
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
                      <th className="p-2">Tiempo efectivo</th>
                      <th className="p-2 text-center">Evidencias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tareasReporte.filter(t => t.estado === 'completada').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
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
                            <td className="p-2 text-slate-600 max-w-xs">{t.notas_cierre || 'Concluido'}</td>
                            <td className="p-2">
                              <div className="font-bold text-slate-800">{formatearDuracion(segundosTrabajadosTarea(t))}</div>
                              <div className="text-[9px] text-slate-500">
                                {tiemposPorTecnico(t).map(x => `${x.nombre}: ${formatearDuracion(x.segundos)}`).join(' • ')}
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex justify-center gap-2 print:gap-1">
                                {t.foto_antes && (
                                  <button type="button" onClick={() => setFotoAmpliada({ src: t.foto_antes, titulo: `Antes • ${t.titulo}` })} className="print:pointer-events-none">
                                    <span className="block text-[9px] mb-0.5 text-slate-500">Antes</span>
                                    <img src={t.foto_antes} alt="Antes" className="w-14 h-14 object-cover rounded border cursor-zoom-in print:w-16 print:h-16" />
                                  </button>
                                )}
                                {t.foto_despues && (
                                  <button type="button" onClick={() => setFotoAmpliada({ src: t.foto_despues, titulo: `Después • ${t.titulo}` })} className="print:pointer-events-none">
                                    <span className="block text-[9px] mb-0.5 text-emerald-700">Después</span>
                                    <img src={t.foto_despues} alt="Después" className="w-14 h-14 object-cover rounded border cursor-zoom-in print:w-16 print:h-16" />
                                  </button>
                                )}
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
            onClick={() => setFiltroEstado('en_curso')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'en_curso' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🟢 En curso
          </button>
          <button 
            onClick={() => setFiltroEstado('en_proceso')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'en_proceso' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔄 En proceso / Relevos
          </button>
          <button 
            onClick={() => setFiltroEstado('proximas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'proximas' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Próximas
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
          <button 
            onClick={() => setFiltroEstado('canceladas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === 'canceladas' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🚫 Canceladas
          </button>
        </nav>
      )}

      {/* BOTÓN FLOTANTE PARA REPORTES EN RECORRIDO / EXPRÉS */}
      {pestañaActiva === 'operacion' && (
        <button 
          onClick={() => {
            setTareaExpres({
              ubicacion: '',
              descripcion: '',
              yaResuelto: usuarioActual.rol === 'tecnico',
              foto: null,
              tipoAtencion: 'hoy',
              fechaProgramada: hoyStr,
              asignadoA: usuarioActual.rol === 'tecnico' ? usuarioActual.id : '',
              tecnicos_seleccionados: usuarioActual.rol === 'tecnico' ? [usuarioActual.id] : []
            });
            setModalExpres(true);
          }}
          className="fixed bottom-16 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 font-bold text-xs transition z-30 transform active:scale-95 print:hidden"
        >
          <PlusCircle className="w-4 h-4" /> {usuarioActual.rol === 'admin' ? '+ Reportar hallazgo' : '+ Exprés / Hallazgo'}
        </button>
      )}

      {/* MODAL HISTORIAL / DETALLE */}
      {modalHistorial && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Detalle / Historial de la actividad</h3>
                <p className="text-[11px] text-slate-500">{modalHistorial.tarea.titulo}</p>
              </div>
              <button onClick={() => setModalHistorial(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {cargandoHistorial ? (
              <p className="text-xs text-slate-500 py-6 text-center">Cargando historial...</p>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="font-bold text-slate-700 mb-2">Tiempos por técnico</p>
                  {modalHistorial.sesiones.filter(s => perfiles.find(p => p.id === s.tecnico_id)?.rol === 'tecnico').length === 0 ? (
                    <p className="text-slate-400">Aún no hay sesiones registradas.</p>
                  ) : modalHistorial.sesiones.filter(s => perfiles.find(p => p.id === s.tecnico_id)?.rol === 'tecnico').map(s => {
                    const p = perfiles.find(p => p.id === s.tecnico_id);
                    const ini = new Date(s.fecha_inicio);
                    const fin = s.fecha_fin ? new Date(s.fecha_fin) : null;
                    const seg = Math.max(0, Math.floor(((fin ? fin.getTime() : ahoraReloj) - ini.getTime()) / 1000));
                    return (
                      <div key={s.id} className="py-2 border-b border-slate-100 last:border-0">
                        <div className="flex flex-wrap justify-between gap-2"><strong>{p?.nombre || 'Técnico'}</strong><span>{formatearDuracion(seg)}</span></div>
                        <div className="text-[10px] text-slate-500">{ini.toLocaleString('es-MX')} → {fin ? fin.toLocaleString('es-MX') : 'En curso'}{s.tipo_fin ? ` • ${s.tipo_fin}` : ''}{s.notas ? ` • ${s.notas}` : ''}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="font-bold text-slate-700 mb-2">Avances / relevos</p>
                  {modalHistorial.avances.length === 0 ? <p className="text-slate-400">Sin avances registrados.</p> : modalHistorial.avances.map(a => (
                    <div key={a.id} className="py-2 border-b border-slate-100 last:border-0">
                      <strong>{perfiles.find(p => p.id === a.tecnico_id)?.nombre || 'Técnico'}</strong> • {a.porcentaje_avance || 0}%
                      <p className="text-slate-600 mt-0.5">{a.notas_avance || 'Sin nota'}</p>
                      {a.foto_avance && <button type="button" onClick={() => setFotoAmpliada({src:a.foto_avance,titulo:'Evidencia de avance'})}><img src={a.foto_avance} alt="Avance" className="mt-2 w-24 h-20 object-cover rounded-lg border cursor-zoom-in" /></button>}
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="font-bold text-slate-700 mb-2">Bloqueos</p>
                  {modalHistorial.bloqueos.length === 0 ? <p className="text-slate-400">Sin bloqueos registrados.</p> : modalHistorial.bloqueos.map(b => (
                    <div key={b.id} className="py-2 border-b border-slate-100 last:border-0"><strong>{b.motivo}</strong><p className="text-slate-600">{b.detalle || 'Sin detalle'}</p></div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="font-bold text-slate-700 mb-2">Evidencias</p>
                  {modalHistorial.fotos.length === 0 ? <p className="text-slate-400">Sin fotografías en el historial.</p> : (
                    <div className="flex flex-wrap gap-3">{modalHistorial.fotos.map(f => (
                      <div key={f.id} className="text-center text-[10px] text-slate-500"><span className="block capitalize mb-1">{f.tipo}</span><button type="button" onClick={() => setFotoAmpliada({src:f.url,titulo:`${f.tipo} • ${modalHistorial.tarea.titulo}`})}><img src={f.url} alt={f.tipo} className="w-24 h-20 object-cover rounded-lg border cursor-zoom-in" /></button></div>
                    ))}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISOR DE FOTOGRAFÍAS */}
      {fotoAmpliada && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 print:hidden" onClick={() => setFotoAmpliada(null)}>
          <div className="max-w-5xl w-full max-h-[94vh] flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-white">
              <span className="text-sm font-semibold">{fotoAmpliada.titulo}</span>
              <button onClick={() => setFotoAmpliada(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X className="w-5 h-5" /></button>
            </div>
            <img src={fotoAmpliada.src} alt={fotoAmpliada.titulo} className="max-w-full max-h-[84vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* MODAL INICIAR / CONTINUAR */}
      {modalInicio && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {modalInicio.estado === 'en_proceso' ? 'Continuar actividad / Iniciar turno' : 'Iniciar actividad'}
                </h3>
                <p className="text-[11px] text-slate-500">{modalInicio.titulo}</p>
              </div>
              <button onClick={() => setModalInicio(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {(modalInicio.estado === 'pendiente' || modalInicio.estado === 'bloqueada') && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <p className="font-bold text-blue-900 mb-2">¿Quiénes iniciarán esta actividad?</p>
                  <div className="space-y-2">
                    {tecnicosAsignadosTarea(modalInicio).map(t => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tecnicosInicio.includes(t.id)}
                          onChange={() => alternarTecnicoInicio(t.id)}
                          className="accent-blue-600"
                        />
                        <span className="font-semibold text-slate-700">{t.nombre}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-700 mt-2">Con un solo inicio se abrirá el cronómetro de todos los seleccionados. Después cada técnico puede pausar o continuar únicamente su propio tiempo.</p>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Foto antes / estado al recibir la actividad</label>
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition min-h-[120px]">
                  {fotoInicio ? (
                    <img src={fotoInicio} alt="Antes" className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500">Tomar o subir foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => procesarFoto(e, setFotoInicio)} />
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Observación inicial (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Se recibe fuga activa / falta retirar pieza..."
                  value={notasInicio}
                  onChange={e => setNotasInicio(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-2">
                En el primer inicio se abre el tiempo del equipo seleccionado. Si la actividad ya está en proceso, cada técnico únicamente reanuda su propio tiempo. El administrador puede supervisar sin generar tiempo.
              </p>
            </div>

            <button
              onClick={guardarInicioActividad}
              disabled={guardandoInicio}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {guardandoInicio ? 'Iniciando...' : ((modalInicio.estado === 'pendiente' || modalInicio.estado === 'bloqueada') ? 'Iniciar equipo y registrar tiempo' : 'Continuar mi tiempo')}
            </button>
          </div>
        </div>
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
                    {!fotoAntes && <span className="text-[9px] text-slate-400 mt-1">Sin evidencia inicial</span>}
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
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => procesarFoto(e, setFotoDespues)} />
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
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => procesarFoto(e, setFotoAvance)} />
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

      {/* MODAL EXPRÉS / REPORTE EN RECORRIDO */}
      {modalExpres && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {usuarioActual.rol === 'admin' ? 'Reportar hallazgo en recorrido' : 'Nueva atención exprés / hallazgo'}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Registra algo que atendiste o una nueva actividad detectada durante el recorrido.
                </p>
              </div>
              <button onClick={() => setModalExpres(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">¿Dónde fue?</label>
                <input 
                  type="text" 
                  placeholder="Ej. Pasillo 3 / Cafetería / Salón 204" 
                  value={tareaExpres.ubicacion}
                  onChange={e => setTareaExpres({...tareaExpres, ubicacion: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  {tareaExpres.yaResuelto ? '¿Qué se realizó?' : '¿Qué encontraste / qué se necesita hacer?'}
                </label>
                <textarea 
                  rows={3} 
                  placeholder={tareaExpres.yaResuelto ? 'Ej. Ajuste rápido de cerradura' : 'Ej. Lámpara apagada; revisar conexión y sustituir si es necesario'} 
                  value={tareaExpres.descripcion}
                  onChange={e => setTareaExpres({...tareaExpres, descripcion: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Tipo de registro</label>
                <select 
                  value={tareaExpres.yaResuelto ? 'si' : 'no'}
                  onChange={e => setTareaExpres({...tareaExpres, yaResuelto: e.target.value === 'si'})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="si">✅ Ya lo atendí / quedó solucionado</option>
                  <option value="no">🔧 Requiere atención / dejar como tarea</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  {tareaExpres.yaResuelto ? 'Foto / evidencia (opcional)' : 'Foto inicial del hallazgo (opcional)'}
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                  {tareaExpres.foto ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setFotoAmpliada({ src: tareaExpres.foto, titulo: tareaExpres.yaResuelto ? 'Evidencia de atención exprés' : 'Evidencia inicial del hallazgo' })}
                        className="relative w-full"
                      >
                        <img src={tareaExpres.foto} alt="Evidencia" className="w-full h-32 object-cover rounded-lg cursor-zoom-in" />
                        <Maximize2 className="absolute bottom-2 right-2 w-5 h-5 p-0.5 rounded bg-black/60 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTareaExpres(prev => ({...prev, foto: null}))}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Quitar fotografía
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500">Sin fotografía seleccionada</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <label className="cursor-pointer border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg p-2.5 flex items-center justify-center gap-1.5 font-semibold">
                      <Camera className="w-4 h-4" /> Tomar foto
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={e => procesarFoto(e, foto => setTareaExpres(prev => ({...prev, foto})))}
                      />
                    </label>
                    <label className="cursor-pointer border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg p-2.5 flex items-center justify-center gap-1.5 font-semibold">
                      <FileText className="w-4 h-4" /> Subir imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => procesarFoto(e, foto => setTareaExpres(prev => ({...prev, foto})))}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {!tareaExpres.yaResuelto && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">¿Cuándo debe atenderse?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {valor:'urgente', etiqueta:'🔴 Urgente'},
                        {valor:'hoy', etiqueta:'🟠 Hoy'},
                        {valor:'programar', etiqueta:'🔵 Programar'}
                      ].map(op => (
                        <button
                          type="button"
                          key={op.valor}
                          onClick={() => setTareaExpres({...tareaExpres, tipoAtencion: op.valor})}
                          className={`p-2 rounded-lg border text-[10px] font-bold transition ${
                            tareaExpres.tipoAtencion === op.valor
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {op.etiqueta}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tareaExpres.tipoAtencion === 'programar' && (
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Fecha para atender</label>
                      <input
                        type="date"
                        min={hoyStr}
                        value={tareaExpres.fechaProgramada}
                        onChange={e => setTareaExpres({...tareaExpres, fechaProgramada: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Responsable(s) / apoyo</label>
                    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                      {tecnicosLista.map(t => {
                        const seleccionado = (tareaExpres.tecnicos_seleccionados || []).includes(t.id);
                        const esCreadorTecnico = usuarioActual.rol === 'tecnico' && t.id === usuarioActual.id;
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => {
                              if (esCreadorTecnico) return;
                              setTareaExpres(prev => ({
                                ...prev,
                                tecnicos_seleccionados: seleccionado
                                  ? prev.tecnicos_seleccionados.filter(id => id !== t.id)
                                  : [...prev.tecnicos_seleccionados, t.id]
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${seleccionado ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'} ${esCreadorTecnico ? 'cursor-default' : ''}`}
                          >
                            {seleccionado ? '✓ ' : ''}{t.nombre.split(' ')[0]}{esCreadorTecnico ? ' (tú)' : ''}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Puedes seleccionar a varios. Si eres técnico, tú quedas incluido automáticamente y puedes agregar apoyo.</p>
                  </div>
                </>
              )}

              {tareaExpres.yaResuelto && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">¿Quién(es) participaron?</label>
                    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                      {tecnicosLista.map(t => {
                        const seleccionado = (tareaExpres.tecnicos_seleccionados || []).includes(t.id);
                        const esCreadorTecnico = usuarioActual.rol === 'tecnico' && t.id === usuarioActual.id;
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => {
                              if (esCreadorTecnico) return;
                              setTareaExpres(prev => ({
                                ...prev,
                                tecnicos_seleccionados: seleccionado
                                  ? prev.tecnicos_seleccionados.filter(id => id !== t.id)
                                  : [...prev.tecnicos_seleccionados, t.id]
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${seleccionado ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'} ${esCreadorTecnico ? 'cursor-default' : ''}`}
                          >
                            {seleccionado ? '✓ ' : ''}{t.nombre.split(' ')[0]}{esCreadorTecnico ? ' (tú)' : ''}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Sirve para dejar registro si la atención exprés fue realizada por más de una persona.</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-emerald-800">
                    Se guardará como actividad completada en recorrido. La fotografía, si agregas una, quedará como evidencia final.
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                onClick={() => guardarTareaExpres(false)}
                disabled={guardandoExpres}
                className="bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-lg shadow-md transition"
              >
                {guardandoExpres ? 'Guardando...' : 'Guardar en la app'}
              </button>

              {!tareaExpres.yaResuelto && (
                <button 
                  onClick={() => guardarTareaExpres(true)}
                  disabled={guardandoExpres}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Guardar y avisar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR APOYO / TRANSFERIR */}
      {modalResponsables && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {modalResponsables.modo === 'transferir' ? 'Transferir / Reasignar actividad' : 'Agregar apoyo a la actividad'}
                </h3>
                <p className="text-[11px] text-slate-500">{modalResponsables.tarea.titulo}</p>
              </div>
              <button onClick={() => setModalResponsables(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="text-xs space-y-3">
              {modalResponsables.modo === 'transferir' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-indigo-800">
                  Al transferir se cerrarán los cronómetros abiertos. El nuevo responsable comenzará su tiempo cuando pulse <strong>Continuar mi tiempo</strong>.
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Selecciona técnico(s)</label>
                <div className="flex flex-wrap gap-2">
                  {tecnicosLista.map(t => {
                    const seleccionado = responsablesSeleccionados.includes(t.id);
                    return (
                      <button key={t.id} type="button" onClick={() => alternarResponsable(t.id)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${seleccionado ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-300'}`}>
                        {seleccionado ? '✓ ' : ''}{t.nombre.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Nota / motivo (opcional)</label>
                <textarea rows={3} value={notaCambioResponsables} onChange={e => setNotaCambioResponsables(e.target.value)}
                  placeholder={modalResponsables.modo === 'transferir' ? 'Ej. Debo atender una urgencia; queda desmontada la pieza.' : 'Ej. Se requiere apoyo para mover mobiliario.'}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <button onClick={guardarCambioResponsables} disabled={guardandoResponsables}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-lg shadow-md transition">
              {guardandoResponsables ? 'Guardando...' : (modalResponsables.modo === 'transferir' ? 'Confirmar transferencia' : 'Agregar apoyo')}
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
