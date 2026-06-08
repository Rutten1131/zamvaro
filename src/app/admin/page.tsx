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
  AlertCircle
} from 'lucide-react';
import styles from './admin.module.css';

// Estructura vacía para inicializar un producto nuevo
const emptyProduct = {
  name: '',
  subtitle: '',
  hookText: '',
  category: 'Belleza',
  price: '$24.99',
  originalPrice: '$50.00',
  tag: 'Más vendido',
  emoji: '✨',
  image: '',
  images: [] as string[],
  imageProblem: '',
  imageFeatures: '',
  imageHowTo: '',
  isAvailable: true,
  slug: '',
  bullets: ['', '', '', ''],
  features: [
    { emoji: '🔥', title: '', description: '' },
    { emoji: '✨', title: '', description: '' },
    { emoji: '🌡️', title: '', description: '' },
    { emoji: '🤲', title: '', description: '' },
  ],
  testimonials: [
    { name: '', city: 'Quito, Ecuador', rating: 5, text: '', avatar: '👩', date: 'Mayo 2026' },
    { name: '', city: 'Guayaquil, Ecuador', rating: 5, text: '', avatar: '👱‍♂️', date: 'Mayo 2026' },
    { name: '', city: 'Cuenca, Ecuador', rating: 5, text: '', avatar: '👩‍🦱', date: 'Mayo 2026' },
  ],
  comparisonTitle: '¿Por qué Zamvaro Ecuador es diferente?',
  comparisonOursLabel: 'Marca Zamvaro',
  comparisonTheirsLabel: 'Genéricos',
  comparison: [
    { label: 'Seca y Alisa al mismo tiempo', ours: true, theirs: false },
    { label: 'Elimina el frizz con iones negativos', ours: true, theirs: false },
    { label: 'Listo en menos de 15 minutos', ours: true, theirs: false },
    { label: 'Sin daño por calor excesivo', ours: true, theirs: false },
    { label: 'Fácil de usar en casa', ours: true, theirs: false },
    { label: 'Pago al recibir en Ecuador', ours: true, theirs: false },
  ],
  stats: [
    { value: '97%', label: 'reportan ahorro de tiempo significativo' },
    { value: '94%', label: 'notan reducción del frizz desde la primera sesión' },
    { value: '91%', label: 'obtienen resultados de salón sin salir' },
  ],
  steps: [
    { number: '01', emoji: '💆‍♀️', title: 'Prepara tu cabello', description: '' },
    { number: '02', emoji: '🔄', title: 'Peina por secciones', description: '' },
    { number: '03', emoji: '💫', title: 'Disfruta el resultado', description: '' },
  ],
  faqs: [
    { question: '¿Funciona para todo tipo de cabello?', answer: '' },
    { question: '¿Cuánto tarda en dar resultados?', answer: '' },
    { question: '¿Daña o quema el cabello?', answer: '' },
    { question: '¿Cómo llega mi pedido y cuándo pago?', answer: 'Hacemos el envío gratis a todo el país. Coordinamos la entrega por WhatsApp y pagas en efectivo cuando el mensajero te entregue el producto.' },
  ],
  guaranteeText: 'Garantía de satisfacción total por 30 días. Si no cumple tus expectativas, nos contactas y gestionamos tu cambio o reembolso. Zamvaro Ecuador garantiza tu tranquilidad en cada compra.',
  whatsappNumber: '593939243014',
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'list' | 'edit'>('list');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
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
                        <div key={idx} className={styles.galleryThumbContainer} style={{ position: 'relative' }}>
                          <img src={img} alt={`Foto ${idx + 1}`} className={styles.galleryThumb} style={{ border: idx === 0 ? '3px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                          {idx === 0 && (
                            <span style={{ position: 'absolute', bottom: '2px', left: '2px', right: '2px', background: 'var(--color-primary)', color: 'white', fontSize: '9px', textAlign: 'center', borderRadius: '3px', padding: '1px 2px', fontWeight: 700 }}>PORTADA</span>
                          )}
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
                          min="1"
                          max="5"
                          className={styles.input}
                          value={testimonial.rating}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index] = { ...newTestimonials[index], rating: parseInt(e.target.value) || 5 };
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
      </div>
    </div>
  );
}
