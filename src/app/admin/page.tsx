'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Image as ImageIcon,
  Save,
  LogOut,
  ShoppingBag,
  List,
  Eye,
  CheckCircle,
  AlertCircle,
  Mail,
  Send
} from 'lucide-react';
import styles from './admin.module.css';

// Estructura vacía para inicializar un producto nuevo
const emptyProduct = {
  name: '',
  subtitle: '',
  hookText: '',
  category: '',
  price: '',
  originalPrice: '',
  tag: '',
  emoji: '',
  image: '',
  images: [] as string[],
  imageProblem: '',
  imageFeatures: '',
  imageHowTo: '',
  isAvailable: true,
  slug: '',
  bullets: [] as string[],
  features: [] as { emoji: string; title: string; description: string }[],
  testimonials: [] as { name: string; city: string; rating: number; text: string; avatar: string; date: string }[],
  comparisonTitle: '',
  comparisonOursLabel: '',
  comparisonTheirsLabel: '',
  comparison: [] as { label: string; ours: boolean; theirs: boolean }[],
  stats: [] as { value: string; label: string }[],
  steps: [] as { number: string; emoji: string; title: string; description: string }[],
  faqs: [] as { question: string; answer: string }[],
  guaranteeText: '',
  whatsappNumber: '',
  primaryColor: '#9B046F',
  problemFactors: [] as { label: string; detail: string }[],
  problemTagline: '',
  problemHeadline: '',
  facebookPixelId: '',
};


export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'list' | 'edit' | 'chatbot' | 'newsletter'>('list');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Newsletter states
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    title: '',
    body: '',
    imageUrl: '',
    buttonText: '',
    buttonUrl: '',
  });

  const fetchSubscribers = async () => {
    setNewsletterLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este suscriptor?')) return;
    setNewsletterLoading(true);
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Suscriptor eliminado correctamente.' });
        fetchSubscribers();
      } else {
        setStatusMsg({ type: 'error', text: 'Error al eliminar suscriptor.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm.subject || !newsletterForm.body) {
      setStatusMsg({ type: 'error', text: 'Asunto y cuerpo del mensaje son obligatorios.' });
      return;
    }
    if (subscribers.length === 0) {
      setStatusMsg({ type: 'error', text: 'No hay suscriptores a quienes enviar el boletín.' });
      return;
    }
    if (!confirm(`¿Estás seguro de enviar este boletín a ${subscribers.length} suscriptores?`)) return;

    setNewsletterLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterForm),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Boletín enviado con éxito a ${data.count} suscriptores. 🎉` });
        setNewsletterForm({
          subject: '',
          title: '',
          body: '',
          imageUrl: '',
          buttonText: '',
          buttonUrl: '',
        });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Error al enviar el boletín.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Chatbot states
  const [chatbotData, setChatbotData] = useState<any>({
    stats: { total_sessions: 0, total_clients: 0, total_orders: 0, confirmed_orders: 0 },
    recentMessages: [],
    mappings: []
  });
  const [chatbotSubTab, setChatbotSubTab] = useState<'dashboard' | 'mappings' | 'sessions' | 'logs'>('dashboard');
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  // Mapping Form state
  const [mappingForm, setMappingForm] = useState({
    ad_source_id: '',
    product_id: '',
    ad_name: '',
    campaign_name: '',
    adset_name: '',
    is_confirmed: true
  });


  const fetchChatbotData = async () => {
    setChatbotLoading(true);
    try {
      const res = await fetch('/api/admin/chatbot');
      if (res.ok) {
        const data = await res.json();
        setChatbotData(data);
      }
    } catch (err) {
      console.error('Error fetching chatbot dashboard data:', err);
    } finally {
      setChatbotLoading(false);
    }
  };

  const fetchChatbotSessions = async () => {
    setChatbotLoading(true);
    try {
      const res = await fetch('/api/admin/chatbot?action=sessions');
      if (res.ok) {
        const data = await res.json();
        setSessionsList(data);
      }
    } catch (err) {
      console.error('Error fetching chatbot sessions:', err);
    } finally {
      setChatbotLoading(false);
    }
  };

  const fetchChatbotClients = async () => {
    setChatbotLoading(true);
    try {
      const res = await fetch('/api/admin/chatbot?action=clients');
      if (res.ok) {
        const data = await res.json();
        setClientsList(data);
      }
    } catch (err) {
      console.error('Error fetching chatbot clients:', err);
    } finally {
      setChatbotLoading(false);
    }
  };

  const fetchChatbotOrders = async () => {
    setChatbotLoading(true);
    try {
      const res = await fetch('/api/admin/chatbot?action=orders');
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
      }
    } catch (err) {
      console.error('Error fetching chatbot orders:', err);
    } finally {
      setChatbotLoading(false);
    }
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingForm.ad_source_id || !mappingForm.product_id) {
      setStatusMsg({ type: 'error', text: 'ID del anuncio y Producto son obligatorios.' });
      return;
    }
    setChatbotLoading(true);
    try {
      const res = await fetch('/api/admin/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingForm),
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Mapeo guardado correctamente.' });
        setMappingForm({
          ad_source_id: '',
          product_id: '',
          ad_name: '',
          campaign_name: '',
          adset_name: '',
          is_confirmed: true
        });
        fetchChatbotData();
      } else {
        const data = await res.json();
        setStatusMsg({ type: 'error', text: data.message || 'Error al guardar mapeo.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setChatbotLoading(false);
    }
  };

  const handleDeleteMapping = async (ad_source_id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mapeo?')) return;
    setChatbotLoading(true);
    try {
      const res = await fetch(`/api/admin/chatbot?ad_source_id=${ad_source_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Mapeo eliminado.' });
        fetchChatbotData();
      } else {
        setStatusMsg({ type: 'error', text: 'Error al eliminar mapeo.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setChatbotLoading(false);
    }
  };
  
  // Estado para el formulario de producto
  const [formData, setFormData] = useState<typeof emptyProduct & { id?: number }>(emptyProduct);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Cargar productos al iniciar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/check-session');
      if (res.ok) {
        setIsLoggedIn(true);
        fetchProducts();
        fetchSubscribers();
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('No se pudieron obtener productos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
        setStatusMsg({ type: 'success', text: 'Sesión iniciada. Cargando dashboard...' });
        fetchProducts();
        fetchSubscribers();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Credenciales incorrectas' });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Error al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Para cerrar sesión de forma sencilla, eliminamos la cookie expirándola
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsLoggedIn(false);
    setProducts([]);
  };

  // Crear slug automáticamente al cambiar el nombre
  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
      .trim()
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, name: val, slug }));
  };

  // Generador de IA con Gemini
  const handleGenerateAI = async () => {
    if (!aiText) return;
    setAiLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiText }),
      });
      const data = await res.json();
      if (data.success) {
        // Combinamos la respuesta de la IA con el formData
        setFormData({
          ...emptyProduct,
          ...data.product,
          slug: data.product.name
            ? data.product.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
            : '',
          image: formData.image, // Mantener imágenes si ya se subieron
          images: formData.images,
        });
        setStatusMsg({ type: 'success', text: '¡Estructura generada y rellenada exitosamente con IA! ✨ Revisa los campos abajo.' });
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Error al invocar la IA' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error al conectar con la IA: ' + err.message });
    } finally {
      setAiLoading(false);
    }
  };

  // Subir imagen de portada (Thumbnail)
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', files[0]);
    formDataUpload.append('productSlug', formData.slug || formData.name || 'general');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        setStatusMsg({ type: 'success', text: 'Imagen de portada subida con éxito.' });
      } else {
        setStatusMsg({ type: 'error', text: 'Error al subir imagen de portada' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al conectar con servidor de subida' });
    } finally {
      setLoading(false);
    }
  };

  // Subir imagen para la galería
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    try {
      const newImages = [...formData.images];
      for (let i = 0; i < files.length; i++) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', files[i]);
        formDataUpload.append('productSlug', formData.slug || formData.name || 'general');
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        const data = await res.json();
        if (data.success) {
          newImages.push(data.url);
        }
      }
      // image siempre = primer elemento del array
      setFormData((prev) => ({ ...prev, images: newImages, image: newImages[0] || '' }));
      setStatusMsg({ type: 'success', text: 'Imágenes agregadas a la galería.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al subir galería' });
    } finally {
      setLoading(false);
    }
  };

  // Subir imagen para una sección específica del producto
  const handleSectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageProblem' | 'imageFeatures' | 'imageHowTo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('productSlug', formData.slug || formData.name || 'general');
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
        setStatusMsg({ type: 'success', text: 'Imagen de sección subida correctamente.' });
      } else {
        setStatusMsg({ type: 'error', text: 'Error al subir la imagen de sección.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error al subir la imagen de sección.' });
    } finally {
      setLoading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Guardar Producto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setStatusMsg({ type: 'error', text: 'Nombre y Slug son campos requeridos.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);

    const isEdit = formData.id !== undefined;
    const url = isEdit ? `/api/products/${formData.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    // SINCRONIZACIÓN: image siempre es el primer elemento de images
    const syncedFormData = {
      ...formData,
      image: formData.images[0] || formData.image || '',
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncedFormData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: isEdit ? 'Producto actualizado correctamente.' : 'Producto creado con éxito.',
        });
        setFormData(emptyProduct);
        setAiText('');
        fetchProducts();
        setActiveTab('list');
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Error al guardar el producto.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al conectar con la API.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: any) => {
    // SINCRONIZACIÓN: fusionar product.image en product.images para que el admin muestre UNA sola lista unificada
    const baseImages: string[] = Array.isArray(product.images) ? product.images : [];
    const mainImage: string = product.image || '';
    const unifiedImages =
      mainImage && !baseImages.includes(mainImage)
        ? [mainImage, ...baseImages]
        : baseImages.length > 0
        ? baseImages
        : mainImage
        ? [mainImage]
        : [];

    setFormData({
      ...emptyProduct,
      ...product,
      images: unifiedImages,
      image: unifiedImages[0] || '',
    });
    setActiveTab('edit');
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Producto eliminado.' });
        fetchProducts();
      } else {
        setStatusMsg({ type: 'error', text: 'Error al eliminar el producto.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al conectar para eliminar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData(emptyProduct);
    setAiText('');
    setActiveTab('edit');
  };

  // Renderizador de Login
  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.loginWrapper}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', marginBottom: '16px', color: 'var(--color-primary)' }}>
            <Lock size={28} />
          </div>
          <h1 className={styles.loginTitle}>Zamvaro Admin</h1>
          <p className={styles.loginSubtitle}>Inicia sesión para administrar tus productos</p>
          
          {statusMsg && (
            <div className={`${styles.statusMessage} ${statusMsg.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Usuario</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Contraseña</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? <div className={styles.spinner}></div> : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Renderizador de Dashboard
  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        {/* Cabecera del Dashboard */}
        <div className={styles.headerRow}>
          <div>
            <span className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShoppingBag size={12} /> Panel de Administración
            </span>
            <h1 className={styles.dashboardTitle}>Zamvaro Ecuador</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Salir
            </button>
          </div>
        </div>

        {/* Mensaje de Estado */}
        {statusMsg && (
          <div className={`${styles.statusMessage} ${statusMsg.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
            {statusMsg.type === 'error' ? <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />}
            {statusMsg.text}
          </div>
        )}

        {/* Pestañas de Control */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <List size={16} /> Listado de Productos
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'edit' ? styles.tabActive : ''}`}
            onClick={() => {
              if (formData.id === undefined) {
                handleAddNew();
              } else {
                setActiveTab('edit');
              }
            }}
          >
            <Plus size={16} /> {formData.id !== undefined ? 'Editar Producto' : 'Nuevo Producto'}
          </button>

          <button
            className={`${styles.tab} ${activeTab === 'chatbot' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('chatbot');
              fetchChatbotData();
            }}
          >
            <Sparkles size={16} /> Chatbot WhatsApp
          </button>

          <button
            className={`${styles.tab} ${activeTab === 'newsletter' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('newsletter');
              fetchSubscribers();
            }}
          >
            <Mail size={16} /> Boletín / Newsletter
          </button>
        </div>

        {/* VISTA: Listado de Productos */}
        {activeTab === 'list' && (
          <div className={styles.cardList}>
            {loading && products.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Cargando productos...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Visual</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Disponibilidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {product.image ? (
                          <img src={product.image} alt={product.name} className={styles.productThumb} />
                        ) : (
                          <div className={styles.emojiThumb}>{product.emoji || '📦'}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                          /productos/{product.slug}
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>{product.price}</td>
                      <td>
                        <span className={`${styles.badge} ${product.isAvailable ? styles.badgeSuccess : styles.badgeWarning}`}>
                          {product.isAvailable ? 'Disponible' : 'Próximamente'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <a
                            href={`/productos/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.iconBtn}
                            title="Ver en la web"
                          >
                            <Eye size={16} />
                          </a>
                          
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleEditClick(product)}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            onClick={() => handleDeleteClick(product.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                        No hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VISTA: Editor / Creador de Producto */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSaveProduct}>
            
            {/* Sección de IA */}
            <div className={styles.aiSection}>
              <h3 className={styles.aiTitle}>
                <Sparkles size={18} /> Asistente de IA para Productos (Gemini)
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--color-text-light)' }}>
                Pega la información, copia de marketing, especificaciones o descripción del producto que deseas vender. La IA estructurará de forma atractiva la información, escribirá testimonios y autocompletará el formulario por ti.
              </p>
              
              <textarea
                className={styles.textarea}
                placeholder="Ejemplo: Vendo una mini aspiradora inalámbrica recargable portátil para auto y hogar. Cuesta $19.99, antes $40. Es de succión potente, tiene filtros HEPA lavables y dura 30 minutos de batería..."
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
              />
              
              <button
                type="button"
                className={styles.button}
                style={{ marginTop: '12px', width: 'auto', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                onClick={handleGenerateAI}
                disabled={aiLoading}
              >
                {aiLoading ? <div className={styles.spinner}></div> : <><Sparkles size={16} /> Generar Estructura con IA</>}
              </button>
            </div>

            {/* Formulario Principal */}
            <div className={styles.cardList} style={{ padding: '30px', background: 'white' }}>
              
              <h2 className={styles.formSectionTitle}>
                <ShoppingBag size={18} /> Datos Básicos
              </h2>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nombre del Producto *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Slug (Ruta URL) *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Subtítulo Persuasivo</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Categoría</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Precio</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Precio Original (Tachado)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Etiqueta (Tag)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Más vendido, Nuevo"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Emoji Representativo</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.emoji}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emoji: e.target.value }))}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Número de WhatsApp Directo</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.whatsappNumber || '593939243014'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>🎯 Facebook Pixel ID (específico de este producto)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: 1937848746935938"
                    value={formData.facebookPixelId || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, facebookPixelId: e.target.value }))}
                  />
                  <small style={{ color: '#888', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Deja en blanco para usar el Pixel global del sitio. Si ingresas un ID, solo se activará en la página de este producto.</small>
                </div>

                <div className={styles.inputGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
                  <input
                    type="checkbox"
                    id="isAvailableCheck"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isAvailableCheck" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Producto Disponible para venta
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                <label className={styles.label}>Texto de Gancho / Hook</label>
                <textarea
                  className={styles.textarea}
                  value={formData.hookText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hookText: e.target.value }))}
                />
              </div>

              {/* ===================== COLOR PRINCIPAL DE LA PÁGINA ===================== */}
              <h2 className={styles.formSectionTitle}>
                🎨 Color Principal de la Página
              </h2>
              <div style={{ background: 'rgba(139,92,246,0.04)', padding: '24px', borderRadius: '16px', border: '2px solid rgba(139,92,246,0.15)', marginBottom: '24px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '18px', lineHeight: 1.6 }}>
                  Este color reemplaza el morado-rosado en <strong>toda la página del producto</strong>: botones, badges, gradientes, estrellas, borde de sección, etc. También se usa como fondo de la sección «Problema».
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Color Picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={formData.primaryColor || '#9B046F'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      style={{ width: '72px', height: '72px', border: 'none', borderRadius: '12px', cursor: 'pointer', padding: '4px', background: 'transparent' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Selector</span>
                  </div>
                  {/* Preset Colors */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>Colores predefinidos:</span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Morado (default)', color: '#9B046F' },
                        { label: 'Azul eléctrico', color: '#1D4ED8' },
                        { label: 'Naranja vibrante', color: '#EA580C' },
                        { label: 'Verde esmeralda', color: '#059669' },
                        { label: 'Rojo intenso', color: '#DC2626' },
                        { label: 'Añil oscuro', color: '#4338CA' },
                        { label: 'Teal profundo', color: '#0D9488' },
                        { label: 'Fucsia fuerte', color: '#C026D3' },
                      ].map(({ label, color }) => (
                        <button
                          key={color}
                          type="button"
                          title={label}
                          onClick={() => setFormData((prev) => ({ ...prev, primaryColor: color }))}
                          style={{
                            width: '36px', height: '36px', borderRadius: '50%', background: color,
                            border: formData.primaryColor === color ? '3px solid #111' : '2px solid rgba(0,0,0,0.1)',
                            cursor: 'pointer', transition: 'transform 0.15s',
                            transform: formData.primaryColor === color ? 'scale(1.2)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Live Preview */}
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: formData.primaryColor || '#9B046F', color: 'white', padding: '10px 22px', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem' }}>
                      Vista previa botón
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Color seleccionado: <strong>{formData.primaryColor || '#9B046F'}</strong></span>
                  </div>
                </div>
              </div>

              {/* ===================== IMÁGENES POR SECCIÓN ===================== */}
              <h2 className={styles.formSectionTitle}>
                🖼️ Imágenes por Sección de la Página
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '20px', lineHeight: 1.6 }}>
                Cada sección de la página del producto tiene su propia imagen. Aquí puedes configurarlas de forma independiente.
              </p>

              {/* --- SECCIÓN 1: PROBLEMA --- */}
              <div style={{ background: 'rgba(255,100,0,0.04)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(255,100,0,0.15)', marginBottom: '20px' }}>
                <label className={styles.label} style={{ color: '#e05a00', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  🔥 Sección 1 — PROBLEMA
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '14px' }}>
                  Aparece en la sección <strong>"¿Cansada de perder 40 minutos...?"</strong> — es la imagen de fondo/banner de esa sección.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <label style={{ cursor: 'pointer', background: 'rgba(255,100,0,0.12)', color: '#c04a00', border: '1px solid rgba(255,100,0,0.3)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                    📁 Subir imagen
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSectionImageUpload(e, 'imageProblem')} />
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>o pega una URL:</span>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ flex: 1, minWidth: '180px' }}
                    placeholder="https://ejemplo.com/imagen-problema.jpg"
                    value={formData.imageProblem || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageProblem: e.target.value }))}
                  />
                  {formData.imageProblem && (
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, imageProblem: '' }))} style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}>✕ Quitar</button>
                  )}
                </div>
                {formData.imageProblem && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={formData.imageProblem} alt="Preview Problema" style={{ maxHeight: '120px', borderRadius: '10px', border: '2px solid rgba(255,100,0,0.3)', objectFit: 'cover' }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '4px' }}>✅ Imagen cargada para la sección Problema</p>
                  </div>
                )}
              </div>

              {/* --- SECCIÓN 2: FEATURES / TECNOLOGÍA --- */}
              <div style={{ background: 'rgba(100,0,255,0.04)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(100,0,255,0.15)', marginBottom: '20px' }}>
                <label className={styles.label} style={{ color: '#5c00cc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  ✨ Sección 2 — TECNOLOGÍA / FEATURES
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '14px' }}>
                  Aparece en la sección <strong>"Descubre el poder de una tecnología única"</strong> — imagen o banner de esa área.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <label style={{ cursor: 'pointer', background: 'rgba(100,0,255,0.1)', color: '#5c00cc', border: '1px solid rgba(100,0,255,0.25)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                    📁 Subir imagen
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSectionImageUpload(e, 'imageFeatures')} />
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>o pega una URL:</span>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ flex: 1, minWidth: '180px' }}
                    placeholder="https://ejemplo.com/imagen-features.jpg"
                    value={formData.imageFeatures || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageFeatures: e.target.value }))}
                  />
                  {formData.imageFeatures && (
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, imageFeatures: '' }))} style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}>✕ Quitar</button>
                  )}
                </div>
                {formData.imageFeatures && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={formData.imageFeatures} alt="Preview Features" style={{ maxHeight: '120px', borderRadius: '10px', border: '2px solid rgba(100,0,255,0.3)', objectFit: 'cover' }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '4px' }}>✅ Imagen cargada para la sección Tecnología</p>
                  </div>
                )}
              </div>

              {/* --- SECCIÓN 3: CÓMO USAR --- */}
              <div style={{ background: 'rgba(0,180,100,0.04)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(0,180,100,0.2)', marginBottom: '24px' }}>
                <label className={styles.label} style={{ color: '#007a42', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  📋 Sección 3 — CÓMO USAR (3 Pasos)
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '14px' }}>
                  Aparece en la sección <strong>"Cómo usar en 3 pasos"</strong> — imagen ilustrativa de ese bloque.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <label style={{ cursor: 'pointer', background: 'rgba(0,180,100,0.1)', color: '#007a42', border: '1px solid rgba(0,180,100,0.3)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                    📁 Subir imagen
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSectionImageUpload(e, 'imageHowTo')} />
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>o pega una URL:</span>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ flex: 1, minWidth: '180px' }}
                    placeholder="https://ejemplo.com/imagen-howto.jpg"
                    value={formData.imageHowTo || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageHowTo: e.target.value }))}
                  />
                  {formData.imageHowTo && (
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, imageHowTo: '' }))} style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}>✕ Quitar</button>
                  )}
                </div>
                {formData.imageHowTo && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={formData.imageHowTo} alt="Preview HowTo" style={{ maxHeight: '120px', borderRadius: '10px', border: '2px solid rgba(0,180,100,0.3)', objectFit: 'cover' }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '4px' }}>✅ Imagen cargada para la sección Cómo Usar</p>
                  </div>
                )}
              </div>

              {/* Subida de Imágenes */}
              <h2 className={styles.formSectionTitle}>
                <ImageIcon size={18} /> Fotos del Producto
              </h2>
              
              <div style={{ background: 'rgba(0,0,0,0.01)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <label className={styles.label} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📸 Fotos del Carrusel del Producto
                    </label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                      Sube <strong>una o varias fotos</strong>. La <strong>primera foto</strong> se usará como portada en los listados. El resto aparecerá en el carrusel deslizable de la página del producto.
                    </p>
                    
                    <div
                      className={styles.imageUploader}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ cursor: 'pointer' }}
                    >
                      <Plus size={20} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Subir Fotos (puedes seleccionar varias)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Las fotos se guardan en la base de datos</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                      />
                    </div>

                    <div className={styles.inputGroup} style={{ marginTop: '14px' }}>
                      <label className={styles.label} style={{ fontSize: '0.78rem' }}>O pega una URL de imagen directamente:</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          id="urlImageInput"
                        />
                        <button
                          type="button"
                          className={styles.button}
                          style={{ width: 'auto', padding: '0 14px', fontSize: '0.85rem', flexShrink: 0 }}
                          onClick={() => {
                            const input = document.getElementById('urlImageInput') as HTMLInputElement;
                            const url = input?.value?.trim();
                            if (url) {
                              setFormData((prev) => ({
                                ...prev,
                                images: [...prev.images, url],
                                image: prev.images.length === 0 ? url : prev.image,
                              }));
                              input.value = '';
                            }
                          }}
                        >
                          Agregar URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listado de fotos */}
                {formData.images.length > 0 && (
                  <div>
                    <p className={styles.label} style={{ fontSize: '0.8rem', marginBottom: '10px' }}>
                      Fotos cargadas ({formData.images.length}) — La primera es la portada del catálogo:
                    </p>
                    <div className={styles.imageGallery} style={{ flexWrap: 'wrap', gap: '12px' }}>
                       {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={styles.galleryThumbContainer}
                          style={{ position: 'relative', cursor: 'grab' }}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', idx.toString());
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            const toIdx = idx;
                            if (isNaN(fromIdx) || fromIdx === toIdx) return;
                            const newImages = [...formData.images];
                            const [movedItem] = newImages.splice(fromIdx, 1);
                            newImages.splice(toIdx, 0, movedItem);
                            setFormData((prev) => ({
                              ...prev,
                              images: newImages,
                              image: newImages[0] || '',
                            }));
                          }}
                        >
                          <img src={img} alt={`Foto ${idx + 1}`} className={styles.galleryThumb} style={{ border: idx === 0 ? '3px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                          {idx === 0 && (
                            <span style={{ position: 'absolute', bottom: '2px', left: '2px', right: '2px', background: 'var(--color-primary)', color: 'white', fontSize: '9px', textAlign: 'center', borderRadius: '3px', padding: '1px 2px', fontWeight: 700 }}>PORTADA</span>
                          )}
                          
                          {/* Navigation buttons to move left/right */}
                          <div style={{ position: 'absolute', top: '2px', left: '2px', display: 'flex', gap: '2px', zIndex: 10 }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                style={{ background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                onClick={() => {
                                  const newImages = [...formData.images];
                                  const temp = newImages[idx];
                                  newImages[idx] = newImages[idx - 1];
                                  newImages[idx - 1] = temp;
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: newImages,
                                    image: newImages[0] || '',
                                  }));
                                }}
                                title="Mover a la izquierda"
                              >
                                ◀
                              </button>
                            )}
                            {idx < formData.images.length - 1 && (
                              <button
                                type="button"
                                style={{ background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                onClick={() => {
                                  const newImages = [...formData.images];
                                  const temp = newImages[idx];
                                  newImages[idx] = newImages[idx + 1];
                                  newImages[idx + 1] = temp;
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: newImages,
                                    image: newImages[0] || '',
                                  }));
                                }}
                                title="Mover a la derecha"
                              >
                                ▶
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            className={styles.removeThumb}
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx);
                              setFormData((prev) => ({
                                ...prev,
                                images: newImages,
                                image: newImages[0] || '',
                              }));
                            }}
                            title="Quitar foto"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bullets */}
              <h2 className={styles.formSectionTitle}>💡 Viñetas Clave (Bullets)</h2>
              <div className={styles.arrayContainer}>
                {formData.bullets.map((bullet, index) => (
                  <div key={index} className={styles.arrayItem}>
                    <span style={{ fontWeight: 700 }}>#{index + 1}</span>
                    <input
                      type="text"
                      className={styles.input}
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...formData.bullets];
                        newBullets[index] = e.target.value;
                        setFormData((prev) => ({ ...prev, bullets: newBullets }));
                      }}
                    />
                    <button
                      type="button"
                      className={styles.deleteItemBtn}
                      onClick={() => {
                        const newBullets = formData.bullets.filter((_, i) => i !== index);
                        setFormData((prev) => ({ ...prev, bullets: newBullets }));
                      }}
                      title="Eliminar Bullet"
                    >
                      <Trash2 size={14} /> Borrar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      bullets: [...prev.bullets, ''],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar Bullet
                </button>
              </div>

              {/* Características Clave (Features) */}
              <h2 className={styles.formSectionTitle}>⚡ Características (Features Grid)</h2>
              <div className={styles.arrayContainer}>
                {formData.features.map((feature, index) => (
                  <div key={index} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>Característica #{index + 1}</span>
                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => {
                          const newFeatures = formData.features.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, features: newFeatures }));
                        }}
                        title="Eliminar Característica"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup} style={{ maxWidth: '80px' }}>
                        <label className={styles.label}>Emoji</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={feature.emoji}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = { ...newFeatures[index], emoji: e.target.value };
                            setFormData((prev) => ({ ...prev, features: newFeatures }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Título</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                            setFormData((prev) => ({ ...prev, features: newFeatures }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                        <label className={styles.label}>Descripción</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                            setFormData((prev) => ({ ...prev, features: newFeatures }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      features: [...prev.features, { emoji: '✨', title: '', description: '' }],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar Característica
                </button>
              </div>

              {/* Imagen para Sección de Características */}
              <div style={{ background: 'rgba(0,0,0,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                <label className={styles.label} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🖼️ Imagen Sección Características (Centro del Feature Grid)
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                  Sube la imagen del producto que se mostrará en el centro, rodeada por las características.
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionImageUpload(e, 'imageFeatures')}
                  />
                  {formData.imageFeatures && (
                    <div className={styles.galleryThumbContainer}>
                      <img src={formData.imageFeatures} alt="Características" className={styles.galleryThumb} style={{ maxHeight: '80px', borderRadius: '8px' }} />
                      <button
                        type="button"
                        className={styles.removeThumb}
                        onClick={() => setFormData((prev) => ({ ...prev, imageFeatures: '' }))}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Testimonios / Reseñas (Testimonials) */}
              <h2 className={styles.formSectionTitle}>👩 Testimonios / Reseñas</h2>
              <div className={styles.arrayContainer}>
                {formData.testimonials.map((testimonial, index) => (
                  <div key={index} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>Testimonio #{index + 1}</span>
                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => {
                          const newTestimonials = formData.testimonials.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                        }}
                        title="Eliminar Testimonio"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Nombre</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={testimonial.name}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], name: e.target.value };
                            setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Ciudad</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={testimonial.city}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], city: e.target.value };
                            setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ maxWidth: '80px' }}>
                        <label className={styles.label}>Estrellas</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          className={styles.input}
                          value={testimonial.rating}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], rating: parseFloat(e.target.value) || 5 };
                            setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ maxWidth: '80px' }}>
                        <label className={styles.label}>Avatar</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={testimonial.avatar}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], avatar: e.target.value };
                            setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Fecha</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={testimonial.date}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], date: e.target.value };
                            setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ gridColumn: 'span 3' }}>
                        <label className={styles.label}>Comentario</label>
                        <textarea
                          className={styles.textarea}
                          style={{ minHeight: '60px' }}
                          value={testimonial.text}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], text: e.target.value };
                            setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      testimonials: [
                        ...prev.testimonials,
                        { name: '', city: 'Quito, Ecuador', rating: 5, text: '', avatar: '👩', date: 'Mayo 2026' },
                      ],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar Testimonio
                </button>
              </div>

              {/* Comparación */}
              <h2 className={styles.formSectionTitle}>⚖️ Tabla Comparativa</h2>
              <div className={styles.formGrid} style={{ marginBottom: '16px' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Título de Comparación</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.comparisonTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comparisonTitle: e.target.value }))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nuestra Marca (Columna Izq)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.comparisonOursLabel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comparisonOursLabel: e.target.value }))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Competencia (Columna Der)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.comparisonTheirsLabel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comparisonTheirsLabel: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className={styles.arrayContainer}>
                {formData.comparison.map((row, index) => (
                  <div key={index} className={styles.arrayItem}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ flex: 2 }}
                      value={row.label}
                      onChange={(e) => {
                        const newComparison = [...formData.comparison];
                        newComparison[index] = { ...newComparison[index], label: e.target.value };
                        setFormData((prev) => ({ ...prev, comparison: newComparison }));
                      }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={row.ours}
                        onChange={(e) => {
                          const newComparison = [...formData.comparison];
                          newComparison[index] = { ...newComparison[index], ours: e.target.checked };
                          setFormData((prev) => ({ ...prev, comparison: newComparison }));
                        }}
                      /> Nosotros
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={row.theirs}
                        onChange={(e) => {
                          const newComparison = [...formData.comparison];
                          newComparison[index] = { ...newComparison[index], theirs: e.target.checked };
                          setFormData((prev) => ({ ...prev, comparison: newComparison }));
                        }}
                      /> Competencia
                    </label>
                    <button
                      type="button"
                      className={styles.deleteItemBtn}
                      onClick={() => {
                        const newComparison = formData.comparison.filter((_, i) => i !== index);
                        setFormData((prev) => ({ ...prev, comparison: newComparison }));
                      }}
                      title="Eliminar Fila"
                    >
                      <Trash2 size={14} /> Borrar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      comparison: [...prev.comparison, { label: '', ours: true, theirs: false }],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar Fila Comparativa
                </button>
              </div>

              {/* Estadísticas */}
              <h2 className={styles.formSectionTitle}>📊 Estadísticas / Logros</h2>
              <div className={styles.arrayContainer}>
                {formData.stats.map((stat, index) => (
                  <div key={index} className={styles.formGrid} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Valor (Ej: 97%)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: 97%"
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[index] = { ...newStats[index], value: e.target.value };
                          setFormData((prev) => ({ ...prev, stats: newStats }));
                        }}
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.label}>Descripción</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Descripción"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[index] = { ...newStats[index], label: e.target.value };
                          setFormData((prev) => ({ ...prev, stats: newStats }));
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => {
                          const newStats = formData.stats.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, stats: newStats }));
                        }}
                        title="Eliminar Estadística"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      stats: [...prev.stats, { value: '', label: '' }],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar Estadística
                </button>
              </div>

              {/* Pasos de Uso (Steps) */}
              <h2 className={styles.formSectionTitle}>🪜 Pasos de Uso (Cómo Usarlo)</h2>
              <div className={styles.arrayContainer}>
                {formData.steps && formData.steps.map((step, index) => (
                  <div key={index} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>Paso #{index + 1}</span>
                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => {
                          const newSteps = formData.steps.filter((_, i) => i !== index);
                          // Re-calcular números secuenciales automáticos
                          const correctedSteps = newSteps.map((s, idx) => ({
                            ...s,
                            number: String(idx + 1).padStart(2, '0')
                          }));
                          setFormData((prev) => ({ ...prev, steps: correctedSteps }));
                        }}
                        title="Eliminar Paso"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup} style={{ maxWidth: '80px' }}>
                        <label className={styles.label}>Número</label>
                        <input
                          type="text"
                          className={styles.input}
                          disabled
                          value={step.number}
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ maxWidth: '80px' }}>
                        <label className={styles.label}>Emoji</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={step.emoji || ''}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index] = { ...newSteps[index], emoji: e.target.value };
                            setFormData((prev) => ({ ...prev, steps: newSteps }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Título del Paso</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index] = { ...newSteps[index], title: e.target.value };
                            setFormData((prev) => ({ ...prev, steps: newSteps }));
                          }}
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                        <label className={styles.label}>Descripción</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={step.description}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index] = { ...newSteps[index], description: e.target.value };
                            setFormData((prev) => ({ ...prev, steps: newSteps }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    const nextNum = String((formData.steps?.length || 0) + 1).padStart(2, '0');
                    setFormData((prev) => ({
                      ...prev,
                      steps: [...(prev.steps || []), { number: nextNum, emoji: '✨', title: '', description: '' }],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar Paso
                </button>
              </div>

              {/* Imagen para Sección de Pasos de Uso */}
              <div style={{ background: 'rgba(0,0,0,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                <label className={styles.label} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🖼️ Imagen Sección Pasos de Uso (Centro del Layout de 3 Pasos)
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                  Sube la imagen que se mostrará en el centro con el testimonio del cliente encima.
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionImageUpload(e, 'imageHowTo')}
                  />
                  {formData.imageHowTo && (
                    <div className={styles.galleryThumbContainer}>
                      <img src={formData.imageHowTo} alt="Pasos de Uso" className={styles.galleryThumb} style={{ maxHeight: '80px', borderRadius: '8px' }} />
                      <button
                        type="button"
                        className={styles.removeThumb}
                        onClick={() => setFormData((prev) => ({ ...prev, imageHowTo: '' }))}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* FAQs */}
              <h2 className={styles.formSectionTitle}>❓ Preguntas Frecuentes (FAQs)</h2>
              <div className={styles.arrayContainer}>
                {formData.faqs.map((faq, index) => (
                  <div key={index} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>FAQ #{index + 1}</span>
                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => {
                          const newFaqs = formData.faqs.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, faqs: newFaqs }));
                        }}
                        title="Eliminar FAQ"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Pregunta</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                          setFormData((prev) => ({ ...prev, faqs: newFaqs }));
                        }}
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
                      <label className={styles.label}>Respuesta</label>
                      <textarea
                        className={styles.textarea}
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                          setFormData((prev) => ({ ...prev, faqs: newFaqs }));
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addItemBtn}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      faqs: [...prev.faqs, { question: '', answer: '' }],
                    }));
                  }}
                >
                  <Plus size={14} /> Agregar FAQ
                </button>
              </div>

              {/* Garantía */}
              <h2 className={styles.formSectionTitle}>🛡️ Garantía de Compra</h2>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Texto de Garantía</label>
                <textarea
                  className={styles.textarea}
                  value={formData.guaranteeText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, guaranteeText: e.target.value }))}
                />
              </div>

              {/* Botón de Guardado */}
              <button
                type="submit"
                className={styles.button}
                style={{ marginTop: '30px' }}
                disabled={loading}
              >
                {loading ? <div className={styles.spinner}></div> : <><Save size={16} /> Guardar Producto</>}
              </button>
            </div>
          </form>
        )}

        {/* VISTA: Chatbot WhatsApp */}
        {activeTab === 'chatbot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Sub-tabs de Chatbot */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.02)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
              <button
                type="button"
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: chatbotSubTab === 'dashboard' ? 'white' : 'transparent',
                  color: chatbotSubTab === 'dashboard' ? 'var(--color-primary)' : 'var(--color-text-light)',
                  boxShadow: chatbotSubTab === 'dashboard' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => { setChatbotSubTab('dashboard'); fetchChatbotData(); }}
              >
                📊 Dashboard
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: chatbotSubTab === 'mappings' ? 'white' : 'transparent',
                  color: chatbotSubTab === 'mappings' ? 'var(--color-primary)' : 'var(--color-text-light)',
                  boxShadow: chatbotSubTab === 'mappings' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => { setChatbotSubTab('mappings'); fetchChatbotData(); }}
              >
                🔗 Mapeos de Anuncios
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: chatbotSubTab === 'sessions' ? 'white' : 'transparent',
                  color: chatbotSubTab === 'sessions' ? 'var(--color-primary)' : 'var(--color-text-light)',
                  boxShadow: chatbotSubTab === 'sessions' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => { setChatbotSubTab('sessions'); fetchChatbotSessions(); }}
              >
                💬 Conversaciones Activas
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: chatbotSubTab === 'logs' ? 'white' : 'transparent',
                  color: chatbotSubTab === 'logs' ? 'var(--color-primary)' : 'var(--color-text-light)',
                  boxShadow: chatbotSubTab === 'logs' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => { setChatbotSubTab('logs'); fetchChatbotClients(); fetchChatbotOrders(); }}
              >
                📁 Clientes y Pedidos
              </button>
            </div>

            {chatbotLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className={styles.spinner} style={{ borderColor: 'rgba(139, 92, 246, 0.3)', borderTopColor: 'var(--color-primary)', margin: '0 auto 10px' }}></div>
                <span>Cargando datos del chatbot...</span>
              </div>
            )}

            {/* SUB-VISTA: Dashboard */}
            {!chatbotLoading && chatbotSubTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Tarjetas de Estadísticas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Conversaciones Totales</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{chatbotData.stats?.total_sessions || 0}</div>
                  </div>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Clientes Capturados</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{chatbotData.stats?.total_clients || 0}</div>
                  </div>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Pedidos por Chatbot</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{chatbotData.stats?.total_orders || 0}</div>
                  </div>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Pedidos Confirmados</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{chatbotData.stats?.confirmed_orders || 0}</div>
                  </div>
                </div>

                {/* Mensajes Recientes */}
                <div className={styles.cardList} style={{ padding: '24px', background: 'white' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>💬 Historial de Mensajes Recientes</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '8px' }}>
                    {chatbotData.recentMessages && chatbotData.recentMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: msg.direction === 'in' ? 'flex-start' : 'flex-end',
                          maxWidth: '75%',
                          background: msg.direction === 'in' ? 'rgba(0,0,0,0.04)' : 'rgba(139, 92, 246, 0.08)',
                          padding: '12px 16px',
                          borderRadius: msg.direction === 'in' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                          border: '1px solid rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
                          <span>{msg.direction === 'in' ? `📥 Cliente (${msg.phone})` : `📤 Bot (Zamvaro)`}</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>
                          {msg.content}
                        </div>
                        {msg.media_url && (
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                            📎 <a href={msg.media_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Ver archivo adjunto</a>
                          </div>
                        )}
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', alignSelf: 'flex-end', marginTop: '4px' }}>
                          Estado: {msg.state_at_time || 'START'}
                        </div>
                      </div>
                    ))}
                    {(!chatbotData.recentMessages || chatbotData.recentMessages.length === 0) && (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '20px' }}>No hay mensajes registrados aún.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VISTA: Mapeos de Anuncios */}
            {!chatbotLoading && chatbotSubTab === 'mappings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Formulario de mapeo */}
                <div className={styles.cardList} style={{ padding: '24px', background: 'white' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>🔗 Crear Mapeo de Anuncio a Producto</h3>
                  <form onSubmit={handleSaveMapping} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>ID del Anuncio (source_id) *</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: 52548385879075"
                        value={mappingForm.ad_source_id}
                        onChange={(e) => setMappingForm({ ...mappingForm, ad_source_id: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Producto a Asignar *</label>
                      <select
                        className={styles.input}
                        value={mappingForm.product_id}
                        onChange={(e) => setMappingForm({ ...mappingForm, product_id: e.target.value })}
                        required
                      >
                        <option value="">Selecciona un producto...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.emoji} {p.name} ({p.price})</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Nombre del Anuncio (Opcional)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: Collagen Peptides 1"
                        value={mappingForm.ad_name}
                        onChange={(e) => setMappingForm({ ...mappingForm, ad_name: e.target.value })}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Campaña (Opcional)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: Testeo (03/06)"
                        value={mappingForm.campaign_name}
                        onChange={(e) => setMappingForm({ ...mappingForm, campaign_name: e.target.value })}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Conjunto de Anuncios (Opcional)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: Collagen Peptides Toplux"
                        value={mappingForm.adset_name}
                        onChange={(e) => setMappingForm({ ...mappingForm, adset_name: e.target.value })}
                      />
                    </div>

                    <div className={styles.inputGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
                      <input
                        type="checkbox"
                        id="isConfirmedCheck"
                        checked={mappingForm.is_confirmed}
                        onChange={(e) => setMappingForm({ ...mappingForm, is_confirmed: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isConfirmedCheck" style={{ fontWeight: 600, cursor: 'pointer' }}>Confirmado por admin</label>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                      <button type="submit" className={styles.button} style={{ width: 'auto' }}>
                        <Save size={16} /> Guardar Configuración de Mapeo
                      </button>
                    </div>
                  </form>
                </div>

                {/* Listado de Mappings */}
                <div className={styles.cardList}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID Anuncio</th>
                        <th>Campaña / Conjunto</th>
                        <th>Nombre Anuncio</th>
                        <th>Producto Asignado</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatbotData.mappings && chatbotData.mappings.map((map: any) => {
                        const assignedProd = products.find((p) => p.id === map.product_id);
                        return (
                          <tr key={map.ad_source_id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{map.ad_source_id}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{map.campaign_name || '—'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{map.adset_name || '—'}</div>
                            </td>
                            <td>{map.ad_name || '—'}</td>
                            <td>
                              {assignedProd ? (
                                <span style={{ fontWeight: 700 }}>{assignedProd.emoji} {assignedProd.name}</span>
                              ) : (
                                <span style={{ color: 'red' }}>ID {map.product_id} (No encontrado)</span>
                              )}
                            </td>
                            <td>
                              <span className={`${styles.badge} ${map.is_confirmed ? styles.badgeSuccess : styles.badgeWarning}`}>
                                {map.is_confirmed ? 'Confirmado' : 'Fuzzy Match'}
                              </span>
                              {map.match_score > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginLeft: '6px' }}>({map.match_score.toFixed(0)}%)</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                onClick={() => handleDeleteMapping(map.ad_source_id)}
                                title="Eliminar Mapeo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!chatbotData.mappings || chatbotData.mappings.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No hay mapeos de anuncios configurados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* SUB-VISTA: Conversaciones Activas */}
            {!chatbotLoading && chatbotSubTab === 'sessions' && (
              <div className={styles.cardList}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>WhatsApp</th>
                      <th>Estado Bot</th>
                      <th>Producto</th>
                      <th>Última Interacción</th>
                      <th>Datos de Sesión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsList.map((session: any) => (
                      <tr key={session.phone}>
                        <td style={{ fontWeight: 700 }}>{session.phone}</td>
                        <td>
                          <span style={{
                            background: session.current_state === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                            color: session.current_state === 'COMPLETED' ? '#10b981' : 'var(--color-primary)',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
                          }}>
                            {session.current_state}
                          </span>
                        </td>
                        <td>{session.product_name || 'Desconocido'}</td>
                        <td>{new Date(session.last_interaction).toLocaleString()}</td>
                        <td>
                          <pre style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.02)', padding: '6px', borderRadius: '8px', overflowX: 'auto', maxWidth: '300px' }}>
                            {JSON.stringify(session.session_data, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                    {sessionsList.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No hay conversaciones registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-VISTA: Clientes y Pedidos */}
            {!chatbotLoading && chatbotSubTab === 'logs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Clientes */}
                <div className={styles.cardList}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 800 }}>👤 Clientes Capturados por WhatsApp</div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>WhatsApp</th>
                        <th>Ciudad</th>
                        <th>Dirección / Ref</th>
                        <th>Pedidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsList.map((client: any) => (
                        <tr key={client.id}>
                          <td style={{ fontWeight: 700 }}>{client.full_name || '—'}</td>
                          <td>{client.phone}</td>
                          <td>{client.city || '—'}</td>
                          <td>
                            <div>{client.street1 || '—'} {client.street2 ? `y ${client.street2}` : ''}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Barrio: {client.neighborhood || '—'}</div>
                          </td>
                          <td>{client.total_orders} pedido(s)</td>
                        </tr>
                      ))}
                      {clientsList.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No hay clientes registrados aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pedidos */}
                <div className={styles.cardList}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 800 }}>🛒 Pedidos Registrados</div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID Pedido</th>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Monto</th>
                        <th>Dirección de Entrega</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersList.map((order: any) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{order.client_name || '—'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{order.client_phone}</div>
                          </td>
                          <td>{order.product_name}</td>
                          <td style={{ fontWeight: 700 }}>${order.total_price}</td>
                          <td>
                            <div>{order.client_street1} y {order.client_street2}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{order.client_city} ({order.client_neighborhood || '—'})</div>
                          </td>
                          <td>{new Date(order.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                      {ordersList.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No hay pedidos registrados aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>
        )}

        {/* VISTA: Boletín / Newsletter */}
        {activeTab === 'newsletter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Newsletter Grid layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
              
              {/* Formulario de Redacción */}
              <div className={styles.cardList} style={{ padding: '24px', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={20} className={styles.primaryText} style={{ color: 'var(--color-primary)' }} /> Redactar Boletín Informativo
                </h3>
                <form onSubmit={handleSendNewsletter} className={styles.formGrid} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Asunto del Correo *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: ¡Nuevo Esterilizador UV inteligente ya disponible! 🚀"
                      value={newsletterForm.subject}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                      required
                      disabled={newsletterLoading}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Título del Boletín (Cabecera dentro del correo)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Oferta de lanzamiento: 15% de descuento adicional"
                      value={newsletterForm.title}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, title: e.target.value })}
                      disabled={newsletterLoading}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>URL de la Imagen de Banner (Opcional)</label>
                    <input
                      type="url"
                      className={styles.input}
                      placeholder="Ej: https://zambaro.com/banner.jpg"
                      value={newsletterForm.imageUrl}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, imageUrl: e.target.value })}
                      disabled={newsletterLoading}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Cuerpo del Mensaje (Soporta múltiples líneas) *</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Escribe el contenido del correo aquí..."
                      rows={8}
                      value={newsletterForm.body}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, body: e.target.value })}
                      required
                      disabled={newsletterLoading}
                      style={{ minHeight: '150px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Texto de Botón CTA (Opcional)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: Comprar Ahora"
                        value={newsletterForm.buttonText}
                        onChange={(e) => setNewsletterForm({ ...newsletterForm, buttonText: e.target.value })}
                        disabled={newsletterLoading}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Enlace de Botón CTA (Opcional)</label>
                      <input
                        type="url"
                        className={styles.input}
                        placeholder="Ej: https://zambaro.com/productos/esterilizador"
                        value={newsletterForm.buttonUrl}
                        onChange={(e) => setNewsletterForm({ ...newsletterForm, buttonUrl: e.target.value })}
                        disabled={newsletterLoading}
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.button} style={{ marginTop: '10px' }} disabled={newsletterLoading}>
                    {newsletterLoading ? <div className={styles.spinner}></div> : <><Send size={16} /> Enviar a todos los suscriptores ({subscribers.length})</>}
                  </button>
                </form>
              </div>

              {/* Lista de Suscriptores */}
              <div className={styles.cardList} style={{ padding: '24px', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>👥 Suscriptores Registrados</span>
                  <span style={{ fontSize: '0.85rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '12px' }}>
                    {subscribers.length} correos
                  </span>
                </h3>

                <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
                  {newsletterLoading && subscribers.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Cargando suscriptores...</div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Correo Electrónico</th>
                          <th>Fecha de Registro</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub: any) => (
                          <tr key={sub.id}>
                            <td style={{ fontWeight: 600 }}>{sub.email}</td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                              {new Date(sub.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                title="Eliminar Suscriptor"
                                disabled={newsletterLoading}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {subscribers.length === 0 && (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '25px', color: 'var(--color-text-light)' }}>
                              No hay ningún correo suscrito en el boletín.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
