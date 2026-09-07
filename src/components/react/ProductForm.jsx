import React, { useState, useEffect, useRef } from 'react';
import { userStore, fetchWithAuth } from '../../store/authStore.js';
import {
  Plus, Trash2, X, Check, ChevronLeft, Link, Image, Tag, Folder,
  Search, ChevronDown, CheckSquare, Square, Info, ShieldAlert, AlertTriangle, Package,
  MapPin, HelpCircle, RefreshCw, Layers, GitBranch, FileImage, Upload, Globe, ExternalLink, Sparkles
} from 'lucide-react';
import { getMockProducts, saveMockProduct, getWarehouses } from '../../utils/mockDb.js';
import MediaLibraryModal from './MediaLibraryModal.jsx';
import TiptapEditor from './TiptapEditor.jsx';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:6543';

const DEFAULT_PRICE_GROUPS = ['Default', 'Dealer', 'Distributor', 'Special'];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function ProductForm({ productId }) {
  const isEditingMode = !!productId;

  const getAuthToken = () => {
    return userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  };

  // Available Warehouses (Dynamically fetched from backend/store)
  const [availableWarehouses, setAvailableWarehouses] = useState(() => getWarehouses());

  // Form Tabs: 'general' | 'seo'
  const [activeTab, setActiveTab] = useState('general');

  // Product details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInputValue, setSlugInputValue] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);

  // SEO & Metadata state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaImage, setMetaImage] = useState('');
  const [mediaModalTarget, setMediaModalTarget] = useState('gallery'); // 'gallery' | 'seo'

  // Shipping & Physical Attributes
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true);
  const [productWeight, setProductWeight] = useState('');
  const [shippingLength, setShippingLength] = useState('');
  const [shippingWidth, setShippingWidth] = useState('');
  const [shippingHeight, setShippingHeight] = useState('');
  const [shippingClass, setShippingClass] = useState('No shipping class');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [showShippingDetails, setShowShippingDetails] = useState(false);

  const [sku, setSku] = useState('');
  const [warehouseStocks, setWarehouseStocks] = useState(() =>
    getWarehouses().map(w => ({ warehouseCode: w.code, warehouseName: w.name, stock: 0 }))
  );
  const [prices, setPrices] = useState(DEFAULT_PRICE_GROUPS.map(pg => ({ priceGroup: pg, price: '', tiers: [] })));

  // Product Type: 'simple' | 'variation'
  const [productType, setProductType] = useState('simple');
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [variationSearch, setVariationSearch] = useState('');
  const [isVariationSearchOpen, setIsVariationSearchOpen] = useState(false);
  const variationSearchRef = useRef(null);

  // App loading & saving state
  const [isLoading, setIsLoading] = useState(isEditingMode);
  const [error, setError] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  // Media Library modal
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Category Popover UI state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryTree, setCategoryTree] = useState([
    {
      name: 'Electronics',
      children: [
        {
          name: 'Audio',
          children: [
            { name: 'Headphones', children: [] },
            { name: 'Speakers', children: [] }
          ]
        },
        {
          name: 'Displays',
          children: [
            { name: 'Monitors', children: [] },
            { name: 'Curved Displays', children: [] }
          ]
        }
      ]
    },
    {
      name: 'Office Supplies',
      children: [
        {
          name: 'Organizer',
          children: [
            { name: 'Footer', children: [] },
            { name: 'Header', children: [] }
          ]
        }
      ]
    },
    {
      name: 'B2B Catalog',
      children: [
        { name: 'Hardware', children: [] },
        { name: 'Industrial', children: [] }
      ]
    }
  ]);

  // Raw backend categories & tags
  const [rawCategories, setRawCategories] = useState([]);
  const [rawTags, setRawTags] = useState([]);

  // Load backend categories & tags dynamically
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/admin/categories`),
          fetchWithAuth(`${API_URL}/api/admin/tags`)
        ]);

        if (catRes.ok) {
          const json = await catRes.json();
          const list = json.data !== undefined ? json.data : json;
          if (Array.isArray(list) && list.length > 0) {
            setRawCategories(list);
            // Build tree from flat list
            const roots = list.filter(c => !c.parentId).map(c => ({
              id: c.id,
              name: c.name,
              children: list.filter(sub => sub.parentId === c.id).map(sub => ({
                id: sub.id,
                name: sub.name,
                children: []
              }))
            }));
            if (roots.length > 0) {
              setCategoryTree(roots);
            }
          }
        }

        if (tagRes.ok) {
          const tJson = await tagRes.json();
          const tList = tJson.data !== undefined ? tJson.data : tJson;
          if (Array.isArray(tList) && tList.length > 0) {
            setRawTags(tList);
          }
        }
      } catch {
        // fallback
      }
    };
    fetchCategoriesAndTags();
  }, []);

  const handleCategoryToggle = (catName) => {
    setSelectedCategories(prev => {
      if (prev.includes(catName)) {
        return prev.filter(c => c !== catName);
      } else {
        return [...prev, catName];
      }
    });
  };

  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('');

  const getFlatCategoriesList = (nodes) => {
    let list = [];
    nodes.forEach(node => {
      list.push(node.name);
      if (node.children && node.children.length > 0) {
        list = [...list, ...getFlatCategoriesList(node.children)];
      }
    });
    return list;
  };

  const filterTree = (nodes, query) => {
    if (!query) return nodes;
    return nodes
      .map(node => {
        const matchSelf = node.name.toLowerCase().includes(query.toLowerCase());
        const filteredChildren = filterTree(node.children, query);
        if (matchSelf || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const addChildToParent = (nodes, parentName, newChildName) => {
    return nodes.map(node => {
      if (node.name === parentName) {
        if (node.children.some(c => c.name === newChildName)) return node;
        return {
          ...node,
          children: [...node.children, { name: newChildName, children: [] }]
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: addChildToParent(node.children, parentName, newChildName)
        };
      }
      return node;
    });
  };

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const nameTrimmed = newCategoryName.trim();
    const parentTrimmed = newCategoryParent.trim();

    // Persist category to backend
    try {
      const token = getAuthToken();
      await fetch(`${API_URL}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: nameTrimmed,
          slug: slugify(nameTrimmed),
        }),
      });
    } catch {
      // fallback
    }

    setCategoryTree(prevTree => {
      if (parentTrimmed) {
        return addChildToParent(prevTree, parentTrimmed, nameTrimmed);
      } else {
        if (prevTree.some(node => node.name === nameTrimmed)) return prevTree;
        return [...prevTree, { name: nameTrimmed, children: [] }];
      }
    });

    setSelectedCategories(prev => {
      if (!prev.includes(nameTrimmed)) {
        return [...prev, nameTrimmed];
      }
      return prev;
    });

    // Reset create form state
    setShowCreateCategoryForm(false);
    setNewCategoryName('');
    setNewCategoryParent('');
    setCategorySearch('');
  };

  // Tag editor input
  const [tagInputText, setTagInputText] = useState('');
  const [imageInputText, setImageInputText] = useState('');

  // Dropdown ref for category
  const categoryRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (variationSearchRef.current && !variationSearchRef.current.contains(event.target)) {
        setIsVariationSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch product context
  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        setIsLoading(true);
        setError(null);
        try {
          let product = null;
          try {
            const res = await fetchWithAuth(`${API_URL}/api/admin/products/${productId}`);
            if (res.ok) {
              const json = await res.json();
              product = json.data || json;
            }
          } catch (fetchErr) {
            console.warn('API fetch product failed, checking fallback:', fetchErr);
          }

          if (!product) {
            const mockProducts = getMockProducts();
            product = mockProducts.find(p => p.id === productId || p.slug === productId);
          }

          if (!product) {
            throw new Error('Product not found in database or catalog');
          }

          setName(product.name || '');
          setDescription(product.description || '');
          setSlug(product.slug || '');
          setIsActive(product.isActive !== undefined ? product.isActive : true);

          const catList = Array.isArray(product.categories) && product.categories.length > 0
            ? product.categories.map(c => (typeof c === 'object' && c ? c.name : String(c)))
            : (typeof product.category === 'string' ? product.category.split(',').map(s => s.trim()).filter(Boolean) : []);
          setSelectedCategories(catList);

          if (catList.length > 0) {
            const getFlatCategoriesList = (nodes) => {
              let list = [];
              nodes.forEach(node => {
                list.push(node.name);
                if (node.children && node.children.length > 0) {
                  list = [...list, ...getFlatCategoriesList(node.children)];
                }
              });
              return list;
            };

            setCategoryTree(prev => {
              const next = [...prev];
              const flatList = getFlatCategoriesList(next);
              const missingCats = catList.filter(c => !flatList.includes(c));

              if (missingCats.length > 0) {
                let customGroup = next.find(g => g.name === 'Custom Categories');
                if (!customGroup) {
                  customGroup = { name: 'Custom Categories', children: [] };
                  next.push(customGroup);
                }
                missingCats.forEach(c => {
                  if (!customGroup.children.some(ch => ch.name === c)) {
                    customGroup.children.push({ name: c, children: [] });
                  }
                });
              }
              return next;
            });
          }

          const tagNames = Array.isArray(product.tagsList) && product.tagsList.length > 0
            ? product.tagsList.map(t => (typeof t === 'object' && t ? t.name : String(t)))
            : (Array.isArray(product.tags) ? product.tags.map(t => (typeof t === 'object' && t ? t.name : String(t))) : []);
          setTags(tagNames);
          setImages(product.images || []);
          setProductType(product.productType || 'simple');
          setLinkedProducts(product.linkedProducts || []);

          // Restore SEO & Metadata attributes
          setMetaTitle(product.metaTitle || '');
          setMetaDescription(product.metaDescription || '');
          setMetaImage(product.metaImage || '');

          // Restore Shipping & Physical attributes
          setIsPhysicalProduct(product.isPhysicalProduct !== undefined ? product.isPhysicalProduct : true);
          setProductWeight(product.productWeight !== undefined && product.productWeight !== null ? String(product.productWeight) : '');
          setShippingLength(product.shippingLength !== undefined && product.shippingLength !== null ? String(product.shippingLength) : '');
          setShippingWidth(product.shippingWidth !== undefined && product.shippingWidth !== null ? String(product.shippingWidth) : '');
          setShippingHeight(product.shippingHeight !== undefined && product.shippingHeight !== null ? String(product.shippingHeight) : '');
          setShippingClass(product.shippingClass || 'No shipping class');
          setCountryOfOrigin(product.countryOfOrigin || '');
          setHsCode(product.hsCode || '');
          if (product.countryOfOrigin || product.hsCode) {
            setShowShippingDetails(true);
          }

          // Load warehouses list dynamically
          let activeWarehouses = availableWarehouses;
          try {
            const res = await fetchWithAuth(`${API_URL}/api/admin/warehouses`);
            if (res.ok) {
              const json = await res.json();
              const list = json.data || json;
              if (Array.isArray(list) && list.length > 0) {
                activeWarehouses = list;
                setAvailableWarehouses(list);
              }
            }
          } catch (e) {
            // fallback
          }

          // 1. SKU
          setSku(product.sku || product.pricingConfigurations?.[0]?.sku || product.variants?.[0]?.sku || '');

          // 2. Warehouse Stocks
          const rawWhStocks = product.warehouseStocks || product.pricingConfigurations?.[0]?.warehouseStocks || product.variants?.[0]?.warehouseStocks || [];
          const whStocks = activeWarehouses.map(wh => {
            const matched = rawWhStocks.find(
              ws => ws.warehouseCode === wh.code || ws.warehouseName === wh.name || ws.warehouseId === wh.id
            );
            return {
              warehouseCode: wh.code,
              warehouseName: wh.name,
              stock: matched ? (parseInt(matched.stock, 10) || 0) : 0
            };
          });
          setWarehouseStocks(whStocks);

          // 3. Pricing Matrix
          const rawPrices = product.pricestiers || product.prices || product.pricingConfigurations?.[0]?.pricestiers || product.variants?.[0]?.prices || [];
          const mappedPrices = DEFAULT_PRICE_GROUPS.map(pg => {
            const matched = rawPrices.find(p => p.priceGroup === pg);
            return {
              priceGroup: pg,
              price: matched?.price !== undefined && matched?.price !== null ? String(matched.price) : '',
              compare_at_price: matched?.compare_at_price || matched?.compareAtPrice || '',
              tiers: matched?.tiers ? matched.tiers.map(t => ({ minQuantity: t.minQuantity, price: String(t.price) })) : []
            };
          });
          setPrices(mappedPrices);
        } catch (err) {
          console.error('Error loading product details:', err);
          setError(err.message || 'Error loading product');
        } finally {
          setIsLoading(false);
        }
      };
      loadProduct();
    } else {
      // Create empty default variant mapping if adding
      const fetchAndSetEmptyWarehouses = async () => {
        let activeWarehouses = availableWarehouses;
        try {
          const res = await fetch(`${API_URL}/api/admin/warehouses`);
          if (res.ok) {
            const json = await res.json();
            const list = json.data || json;
            if (Array.isArray(list) && list.length > 0) {
              activeWarehouses = list;
              setAvailableWarehouses(list);
            }
          }
        } catch (e) {
          // fallback
        }
        setSku('');
        setWarehouseStocks(activeWarehouses.map(w => ({ warehouseCode: w.code, warehouseName: w.name, stock: 0 })));
        setPrices(DEFAULT_PRICE_GROUPS.map(pg => ({ priceGroup: pg, price: '', compare_at_price: '', tiers: [] })));
      };
      fetchAndSetEmptyWarehouses();
    }
  }, [productId]);

  // Stock/Price editor handlers
  const handleSkuChange = (value) => {
    setSku(value);
  };

  const handleStockChange = (whIdx, value) => {
    const updated = [...warehouseStocks];
    updated[whIdx].stock = parseInt(value, 10) || 0;
    setWarehouseStocks(updated);
  };

  const handlePriceChange = (prIdx, value) => {
    const updated = [...prices];
    updated[prIdx].price = value;
    setPrices(updated);
  };

  const handleCompareAtPriceChange = (prIdx, value) => {
    const updated = [...prices];
    updated[prIdx].compare_at_price = value;
    setPrices(updated);
  };

  // Price Group Tiers logic
  const handleAddTier = (prIdx) => {
    const updated = [...prices];
    const tList = [...(updated[prIdx].tiers || [])];
    tList.push({ minQuantity: 10, price: '' });
    updated[prIdx].tiers = tList;
    setPrices(updated);
  };

  const handleUpdateTier = (prIdx, tierIdx, field, value) => {
    const updated = [...prices];
    const tList = [...updated[prIdx].tiers];
    tList[tierIdx] = {
      ...tList[tierIdx],
      [field]: field === 'minQuantity' ? parseInt(value, 10) || 0 : value
    };
    updated[prIdx].tiers = tList;
    setPrices(updated);
  };

  const handleRemoveTier = (prIdx, tierIdx) => {
    const updated = [...prices];
    updated[prIdx].tiers = updated[prIdx].tiers.filter((_, i) => i !== tierIdx);
    setPrices(updated);
  };

  // Auto-fill slug from name typing
  const handleNameInputChange = (val) => {
    setName(val);
    if (!isEditingMode && !isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };



  // Tag helper logic
  const handleTagAddKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInputText.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
        setTagInputText('');
      }
    }
  };

  const removeTag = (tName) => {
    setTags(prev => prev.filter(t => t !== tName));
  };

  // Image helper logic
  const handleImageAddKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = imageInputText.trim();
      if (val && !images.includes(val)) {
        setImages(prev => [...prev, val]);
        setImageInputText('');
      }
    }
  };

  const removeImage = (imgUrl) => {
    setImages(prev => prev.filter(img => img !== imgUrl));
  };

  // Submit Handler
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }
    if (!slug.trim()) {
      alert('Product URL slug/handle is required.');
      return;
    }

    if (!sku.trim()) {
      alert('Product SKU is required.');
      return;
    }
    const defaultPrice = prices.find(p => p.priceGroup === 'Default')?.price;
    if (!defaultPrice) {
      alert('Default base price is required.');
      return;
    }

    setIsSavingForm(true);
    setFormStatus(null);

    // Compile B2B Product details for static catalog & API
    const savedProd = {
      id: productId || `prod-${Date.now()}`,
      name,
      description,
      slug,
      images,
      // Resolve categoryIds and tagIds
      categoryIds: selectedCategories
        .map(nameOrId => rawCategories.find(c => c.id === nameOrId || c.name.toLowerCase() === nameOrId.toLowerCase())?.id)
        .filter(Boolean),
      category: selectedCategories.length > 0 ? selectedCategories.join(', ') : null,
      tagIds: tags
        .map(nameOrId => rawTags.find(t => t.id === nameOrId || t.name.toLowerCase() === nameOrId.toLowerCase())?.id)
        .filter(Boolean),
      tags,
      isActive,
      sku,
      productType,
      linkedProducts,
      // Shipping & Physical Attributes
      isPhysicalProduct,
      productWeight: productWeight ? parseFloat(productWeight) : null,
      shippingLength: shippingLength ? parseFloat(shippingLength) : null,
      shippingWidth: shippingWidth ? parseFloat(shippingWidth) : null,
      shippingHeight: shippingHeight ? parseFloat(shippingHeight) : null,
      shippingClass,
      countryOfOrigin: countryOfOrigin || null,
      hsCode: hsCode || null,
      // SEO & Search Metadata
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaImage: metaImage || null,
      warehouseStocks: warehouseStocks.map(ws => ({
        warehouseCode: ws.warehouseCode,
        warehouseName: ws.warehouseName || ws.warehouseCode,
        stock: ws.stock || 0
      })),
      prices: prices.filter(p => p.price !== '').map(p => ({
        priceGroup: p.priceGroup,
        price: p.price,
        compare_at_price: p.compare_at_price || undefined,
        tiers: p.tiers ? p.tiers.filter(t => t.price !== '') : []
      })),
      pricingConfigurations: [
        {
          totalStock: warehouseStocks.reduce((sum, ws) => sum + (ws.stock || 0), 0),
          warehouseStocks: warehouseStocks.map(ws => ({
            warehouseCode: ws.warehouseCode,
            warehouseName: ws.warehouseName || ws.warehouseCode,
            stock: ws.stock || 0
          })),
          pricestiers: prices.filter(p => p.price !== '').map(p => ({
            priceGroup: p.priceGroup,
            price: p.price,
            ...(p.compare_at_price && parseFloat(p.compare_at_price) > parseFloat(p.price)
              ? { compare_at_price: p.compare_at_price }
              : {}),
            tiers: p.tiers ? p.tiers.filter(t => t.price !== '') : []
          }))
        }
      ]
    };

    try {
      const method = isEditingMode ? 'PATCH' : 'POST';
      const endpoint = isEditingMode
        ? `${API_URL}/api/admin/products/${productId}`
        : `${API_URL}/api/admin/products`;

      try {
        await fetchWithAuth(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(savedProd),
        });
      } catch (apiErr) {
        console.warn('API sync failed, falling back to local store:', apiErr);
      }

      saveMockProduct(savedProd);

      setFormStatus({
        success: true,
        message: `B2B Product '${name}' saved successfully!`
      });

      setTimeout(() => {
        window.location.href = '/admin/products';
      }, 1200);
    } catch (err) {
      console.error(err);
      setFormStatus({
        success: false,
        message: err.message || 'Error occurred while saving product catalog details'
      });
    } finally {
      setIsSavingForm(false);
    }
  };


  if (isLoading) {
    return (
      <div className="glass-panel p-16 rounded-3xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 gap-3 shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
        <div className="text-xs font-semibold">Loading product configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-16 rounded-3xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 gap-3 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <div className="text-xs font-bold text-slate-700">Failed to load product details</div>
        <div className="text-[11px] text-slate-400 mb-2">{error}</div>
        <a
          href="/admin/products"
          className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <a
              href="/admin/products"
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </a>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">
                {isEditingMode ? 'Edit Product' : 'Add Product'}
              </h2>
              <div className="text-xs text-slate-400">Shopify-style B2B Inventory & Catalog Panel</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin/products"
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              Cancel
            </a>
            <button
              onClick={handleSaveProduct}
              disabled={isSavingForm}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {isSavingForm ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top Tab Bar Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'general'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Package className="w-4 h-4" />
            <span>General Details & Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'seo'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Globe className="w-4 h-4" />
            <span>SEO & Metadata</span>
            {(metaTitle || metaDescription || metaImage) ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ) : null}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: GENERAL PRODUCT DETAILS & PRICING                                  */}
        {/* ========================================================================= */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Information Cards) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Title and Description */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameInputChange(e.target.value)}
                    placeholder="e.g. Flagship 240Hz Curved OLED Gaming Monitor"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-shadow bg-slate-50 hover:bg-slate-50/50"
                  />
                </div>

                {/* WordPress/Shopify style Slug UI */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pb-2 px-1">
                  <span className="font-semibold text-slate-600">Slug:</span>
                  {!isEditingSlug ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/shop/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-mono text-[11px]"
                      >
                        https://tradelogix.in/shop/{slug || 'product-handle'}/
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingSlug(true);
                          setSlugInputValue(slug);
                        }}
                        className="px-2 py-0.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-400">https://tradelogix.in/shop/</span>
                      <input
                        type="text"
                        value={slugInputValue}
                        onChange={(e) => setSlugInputValue(e.target.value)}
                        className="px-2 py-0.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-emerald-600 font-mono w-48 bg-white"
                      />
                      <span className="font-mono text-slate-400">/</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSlug(slugify(slugInputValue));
                          setIsSlugManuallyEdited(true);
                          setIsEditingSlug(false);
                        }}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingSlug(false)}
                        className="px-2 py-0.5 text-slate-400 hover:text-slate-600 text-[10px] font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <span className="text-[10px] text-slate-400">Rich Text (Tiptap)</span>
                  </div>
                  <TiptapEditor
                    content={description}
                    onChange={(val) => setDescription(val)}
                    placeholder="Write product specifications, key features, bullet points, and descriptions..."
                  />
                </div>
              </div>

              {/* Card 2: Media / Images Upload */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-slate-400" /> Media & Product Photos
                  </h3>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaModalTarget('gallery');
                        setShowMediaModal(true);
                      }}
                      className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Add from Media Library
                    </button>
                  )}
                </div>

                <div>
                  {/* Thumbnails grid */}
                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                          <img
                            src={img}
                            alt="Product visual"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img)}
                            className="absolute right-1.5 top-1.5 p-1 bg-white hover:bg-rose-50 text-rose-500 rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                            title="Remove Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add more button tile in grid */}
                      <button
                        type="button"
                        onClick={() => {
                          setMediaModalTarget('gallery');
                          setShowMediaModal(true);
                        }}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/40 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-brand-600 transition-all cursor-pointer group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold">Add Media</span>
                      </button>
                    </div>
                  ) : (
                    /* Clickable empty state dropzone */
                    <div
                      onClick={() => {
                        setMediaModalTarget('gallery');
                        setShowMediaModal(true);
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 rounded-2xl p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer transition-all group"
                    >
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm group-hover:scale-105 group-hover:border-brand-200 transition-all">
                        <Upload className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-xs group-hover:text-brand-600 transition-colors">
                          Open Media Library
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Click to upload photos or select from existing media files
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Shipping & Physical Attributes */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-400" /> Shipping & Logistics
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Physical product</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPhysicalProduct}
                        onChange={(e) => setIsPhysicalProduct(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                    </label>
                  </div>
                </div>

                {isPhysicalProduct && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Weight (kg) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            Weight (kg)
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Weight in kilograms" />
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={productWeight}
                            onChange={(e) => setProductWeight(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>

                        {/* Dimensions (L x W x H in cm) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            Dimensions (L×W×H) (cm)
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Package dimensions: Length x Width x Height in centimeters" />
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={shippingLength}
                              onChange={(e) => setShippingLength(e.target.value)}
                              placeholder="Length"
                              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-center"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={shippingWidth}
                              onChange={(e) => setShippingWidth(e.target.value)}
                              placeholder="Width"
                              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-center"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={shippingHeight}
                              onChange={(e) => setShippingHeight(e.target.value)}
                              placeholder="Height"
                              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-center"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Shipping Class Select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          Shipping class
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Shipping classes are used by cargo gateways to group products" />
                        </label>
                        <div className="relative">
                          <select
                            value={shippingClass}
                            onChange={(e) => setShippingClass(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="No shipping class">No shipping class</option>
                            <option value="Heavy/Bulky Cargo">Heavy/Bulky Cargo</option>
                            <option value="Standard Parcel">Standard Parcel</option>
                            <option value="Fragile Handling">Fragile Handling</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Country of Origin and HS Code */}
                    <div className="border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowShippingDetails(!showShippingDetails)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Country of origin • HS Code
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showShippingDetails ? 'rotate-180' : ''}`} />
                      </button>

                      {showShippingDetails && (
                        <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Country of origin</label>
                            <input
                              type="text"
                              value={countryOfOrigin}
                              onChange={(e) => setCountryOfOrigin(e.target.value)}
                              placeholder="e.g. India"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">HS Code</label>
                            <input
                              type="text"
                              value={hsCode}
                              onChange={(e) => setHsCode(e.target.value)}
                              placeholder="e.g. 8518.30.00"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: Pricing & Inventory */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Pricing & Inventory Settings
                  </div>
                  <div className="text-[10px] text-slate-400 italic">B2B Tier Price Slabs & Stocks</div>
                </div>

                <div className="space-y-6">
                  {/* SKU */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => handleSkuChange(e.target.value)}
                      placeholder="e.g. AP-MB-01"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none"
                    />
                  </div>

                  {/* Warehouse stocks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase">Warehouse stock levels</label>
                      <span className="text-[10px] text-slate-400 font-medium">({warehouseStocks.length} warehouses active)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {warehouseStocks.map((ws, wsIdx) => (
                        <div key={ws.warehouseCode} className="flex flex-col bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center shadow-sm hover:border-slate-300 transition-colors">
                          <span className="text-[11px] font-bold text-slate-800 truncate" title={ws.warehouseName || ws.warehouseCode}>
                            {ws.warehouseName || ws.warehouseCode}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-brand-600 bg-brand-50 rounded px-1.5 py-0.5 self-center mt-0.5 border border-brand-100">
                            {ws.warehouseCode}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={ws.stock}
                            onChange={(e) => handleStockChange(wsIdx, e.target.value)}
                            className="w-full border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 text-xs font-mono text-center font-bold mt-1.5 py-1 bg-white shadow-inner"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* B2B Price Matrix */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">B2B Group Pricing</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {prices.map((pr, prIdx) => (
                        <div key={pr.priceGroup} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-xs font-bold text-slate-700">{pr.priceGroup} Price</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={pr.price}
                                onChange={(e) => handlePriceChange(prIdx, e.target.value)}
                                placeholder="₹"
                                className="w-24 px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-bold font-mono focus:outline-none text-right bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddTier(prIdx)}
                                disabled={pr.price === ''}
                                className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-50 text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                              >
                                + Slabs
                              </button>
                            </div>
                          </div>

                          {/* Compare-at price (MRP) */}
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Compare-at Price <span className="text-slate-400">(MRP)</span></label>
                            <div className="flex flex-col items-end gap-0.5">
                              <input
                                type="text"
                                value={pr.compare_at_price}
                                onChange={(e) => handleCompareAtPriceChange(prIdx, e.target.value)}
                                placeholder="optional"
                                className={`w-24 px-2.5 py-1 border rounded-lg text-xs font-mono focus:outline-none text-right bg-white ${pr.compare_at_price && parseFloat(pr.compare_at_price) <= parseFloat(pr.price || 0)
                                  ? 'border-rose-400 text-rose-600 bg-rose-50'
                                  : 'border-slate-300 text-slate-600'
                                  }`}
                              />
                              {pr.compare_at_price && parseFloat(pr.compare_at_price) <= parseFloat(pr.price || 0) && (
                                <span className="text-[9px] text-rose-500 font-medium">Must be &gt; selling price</span>
                              )}
                              {pr.compare_at_price && parseFloat(pr.compare_at_price) > parseFloat(pr.price || 0) && (
                                <span className="text-[9px] text-emerald-600 font-medium">
                                  -{Math.round((1 - parseFloat(pr.price || 0) / parseFloat(pr.compare_at_price)) * 100)}% off
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity discount slabs */}
                          {pr.tiers && pr.tiers.length > 0 && (
                            <div className="space-y-2">
                              {pr.tiers.map((tr, trIdx) => (
                                <div key={trIdx} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-100 text-xs">
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <span>Qty ≥ </span>
                                    <input
                                      type="number"
                                      value={tr.minQuantity}
                                      onChange={(e) => handleUpdateTier(prIdx, trIdx, 'minQuantity', e.target.value)}
                                      className="w-12 px-1 py-0.5 border border-slate-300 rounded font-mono text-center font-bold"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={tr.price}
                                      onChange={(e) => handleUpdateTier(prIdx, trIdx, 'price', e.target.value)}
                                      placeholder="₹"
                                      className="w-20 px-1 py-0.5 border border-slate-300 rounded font-mono text-right font-bold"
                                    />
                                    <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">/ pc</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTier(prIdx, trIdx)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Search Engine Listing Summary Preview (Shopify style) */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search Engine Listing Preview</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Edit SEO & Social cards</span>
                    <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                <div className="space-y-1 font-sans">
                  <div className="text-[11px] text-slate-500 font-mono">
                    https://tradelogix.in/shop/{slug || 'product-handle'}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer">
                    {metaTitle || (name ? `${name} | TradeLogix Wholesale` : 'Product Title | TradeLogix Wholesale')}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {metaDescription || description?.replace(/<[^>]*>/g, '').substring(0, 150) || 'Discover wholesale OEM hardware with bulk tier discount pricing, instant GST invoicing, and express pan-India dispatch.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar Information Cards) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card 0: Product Type */}
              <div className=" hidden border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" /> Product Type
                </h3>

                {/* Simple / Variation toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setProductType('simple'); setLinkedProducts([]); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${productType === 'simple'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    <Package className="w-5 h-5" />
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('variation')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${productType === 'variation'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    <GitBranch className="w-5 h-5" />
                    Variation
                  </button>
                </div>

                {/* Linked Products for Variations */}
                {productType === 'variation' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Linked Variant Products</label>
                      <span className="text-[10px] text-slate-400">({linkedProducts.length} linked)</span>
                    </div>

                    {/* Search and add product */}
                    <div className="relative" ref={variationSearchRef}>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={variationSearch}
                          onChange={(e) => {
                            setVariationSearch(e.target.value);
                            setIsVariationSearchOpen(true);
                          }}
                          onFocus={() => setIsVariationSearchOpen(true)}
                          placeholder="Search products to link..."
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:bg-white"
                        />
                      </div>

                      {isVariationSearchOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {getMockProducts()
                            .filter(p => p.id !== productId && !linkedProducts.some(lp => lp.productId === p.id || lp.id === p.id))
                            .filter(p => !variationSearch || p.name?.toLowerCase().includes(variationSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(variationSearch.toLowerCase()))
                            .slice(0, 8)
                            .map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setLinkedProducts(prev => [...prev, { id: p.id, productId: p.id, name: p.name, sku: p.sku }]);
                                  setVariationSearch('');
                                  setIsVariationSearchOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                              >
                                <div className="truncate pr-2">
                                  <div className="font-semibold text-slate-800 truncate">{p.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                                </div>
                                <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Linked products list */}
                    {linkedProducts.length > 0 && (
                      <div className="space-y-2">
                        {linkedProducts.map((lp, idx) => (
                          <div key={lp.productId || lp.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-800 truncate block" title={lp.name}>{lp.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{lp.sku}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLinkedProducts(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card 1: Status */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm mb-4 mt-0" style={{ marginTop: "0px" }}>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Status</h3>
                <div className="relative">
                  <select
                    value={isActive ? 'Active' : 'Draft'}
                    onChange={(e) => setIsActive(e.target.value === 'Active')}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none appearance-none cursor-pointer font-medium text-slate-700"
                  >
                    <option value="Active">Active (Visible in Storefront)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Card 2: Product Organization (Category & Tags) */}
              <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Organization</h3>

                {/* Custom Category dropdown with Hierarchical Search/Checkboxes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Categories</label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-left text-xs bg-slate-50 flex items-center justify-between hover:bg-slate-100/50 transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="text-slate-700 truncate max-w-[200px]">
                        {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Select categories'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Popover content */}
                    {isCategoryOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-3 max-w-[280px] min-w-[220px]">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Categories</div>

                        {/* Search bar inside category popover */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Search category..."
                            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                          />
                        </div>

                        {/* Hierarchical Categories checkboxes list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {(() => {
                            const filteredTree = filterTree(categoryTree, categorySearch);

                            const renderNode = (node, level = 0) => {
                              const isChecked = selectedCategories.includes(node.name);
                              return (
                                <div key={node.name} className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryToggle(node.name)}
                                    className="w-full flex items-center gap-2 py-0.5 text-left text-xs text-slate-700 hover:text-slate-900 transition-colors group cursor-pointer"
                                    style={{ paddingLeft: `${level * 12}px` }}
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                                    )}
                                    <span className={isChecked ? 'font-semibold text-emerald-800' : ''}>
                                      {node.name}
                                    </span>
                                  </button>
                                  {node.children && node.children.map(child => renderNode(child, level + 1))}
                                </div>
                              );
                            };

                            if (filteredTree.length === 0) {
                              return <div className="text-[10px] text-slate-400 text-center py-2">No categories found</div>;
                            }

                            return filteredTree.map(rootNode => renderNode(rootNode, 0));
                          })()}
                        </div>

                        {/* Add new category button/link & mini-form */}
                        {!showCreateCategoryForm ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateCategoryForm(true);
                              setNewCategoryName(categorySearch);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-100 w-full text-left cursor-pointer"
                          >
                            + Add new category
                          </button>
                        ) : (
                          <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Category name"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                            />

                            <div className="relative">
                              <select
                                value={newCategoryParent}
                                onChange={(e) => setNewCategoryParent(e.target.value)}
                                className="w-full pl-2.5 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none appearance-none cursor-pointer text-slate-700"
                              >
                                <option value="">— Parent category —</option>
                                {getFlatCategoriesList(categoryTree).map(name => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleCreateCategorySubmit}
                                className="px-3 py-1.5 bg-white border border-blue-600 hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Add category
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCreateCategoryForm(false);
                                  setNewCategoryName('');
                                  setNewCategoryParent('');
                                }}
                                className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shopify style tags picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Tags</label>

                  <div className="space-y-2 bg-slate-50 border border-slate-300 p-2.5 rounded-xl min-h-16 flex flex-wrap gap-1.5">
                    {tags.map((tName) => (
                      <span
                        key={tName}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm"
                      >
                        {tName}
                        <button
                          type="button"
                          onClick={() => removeTag(tName)}
                          className="text-slate-400 hover:text-slate-800 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      value={tagInputText}
                      onChange={(e) => setTagInputText(e.target.value)}
                      onKeyDown={handleTagAddKeyPress}
                      placeholder="+ Add tags"
                      className="bg-transparent text-xs focus:outline-none flex-1 py-1 px-1 min-w-[70px]"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">Press Enter or comma to insert tags</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SEO & METADATA                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'seo' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 max-w-4xl">
            <div className="space-y-1">
              <h2 className="text-base font-display font-black text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-600" />
                <span>Product Search Engine Optimization (SEO) & Social Sharing</span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure how this product appears in Google search engine rankings, social media cards (WhatsApp, Facebook, LinkedIn, X), and browser title bars.
              </p>
            </div>

            <div className="space-y-5">
              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Meta Title (SEO Title)</label>
                  <span
                    className={`text-[10px] font-bold ${(metaTitle || '').length > 60 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                  >
                    {(metaTitle || '').length}/60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={name ? `${name} | TradeLogix Wholesale` : 'e.g. Flagship 240Hz Curved OLED Gaming Monitor | TradeLogix'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Meta Description</label>
                  <span
                    className={`text-[10px] font-bold ${(metaDescription || '').length > 160 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                  >
                    {(metaDescription || '').length}/160 recommended
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Provide a concise product overview, key OEM specifications, volume discounts, warranty coverage, and dispatch terms..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>

              {/* Social Share Preview Image (OG Image) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">Social Share Preview Image (OG Image)</label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      This image is displayed when you share this product link on WhatsApp, Facebook, LinkedIn, X, or Slack.
                    </p>
                  </div>
                  {metaImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaModalTarget('seo');
                        setShowMediaModal(true);
                      }}
                      className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Image</span>
                    </button>
                  )}
                </div>

                {metaImage ? (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
                    <div className="relative group w-32 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
                      <img
                        src={metaImage}
                        alt="Social Share Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="text-xs font-bold text-slate-800 truncate">{metaImage}</div>
                      <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready for URL social share previews (OpenGraph)</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaModalTarget('seo');
                            setShowMediaModal(true);
                          }}
                          className="text-brand-600 hover:text-brand-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Replace</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setMetaImage('')}
                          className="text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setMediaModalTarget('seo');
                      setShowMediaModal(true);
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer transition-all group select-none"
                  >
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:scale-105 group-hover:border-brand-200 transition-all">
                      <Upload className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 text-xs group-hover:text-brand-600 transition-colors">
                        Select Social Share Preview Image
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Click to choose from media library (Recommended: 1200 × 630 px). If empty, first gallery photo will be used automatically.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Google Search Result Preview */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" />
                  <span>Google Search Snippet Preview</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-600 flex items-center gap-1 font-sans">
                    <span>https://tradelogix.in</span>
                    <span>›</span>
                    <span className="text-slate-800 font-mono">shop</span>
                    <span>›</span>
                    <span className="text-slate-800 font-mono">{slug || 'product-handle'}</span>
                  </div>
                  <div className="text-sm text-blue-700 font-medium hover:underline cursor-pointer leading-tight">
                    {metaTitle || (name ? `${name} | TradeLogix Wholesale` : 'Product Title | TradeLogix Wholesale')}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    {metaDescription || description?.replace(/<[^>]*>/g, '').substring(0, 140) || 'Direct B2B wholesale hardware catalog item with volume discount price tiers and verified GST ITC invoices.'}
                  </div>
                </div>
              </div>

              {/* Social Share URL Preview Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Social Share Preview (WhatsApp / FB / X)</span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  {metaImage || images?.[0] ? (
                    <div className="w-full h-32 bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={metaImage || images[0]}
                        alt="Social Card Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-slate-100/80 border-b border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-0.5">
                      <Image className="w-6 h-6 text-slate-300" />
                      <span className="text-[10px]">No share preview image selected</span>
                    </div>
                  )}

                  <div className="p-3 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      tradelogix.in
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">
                      {metaTitle || (name ? `${name} | TradeLogix Wholesale` : 'Product Title | TradeLogix Wholesale')}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {metaDescription || description?.replace(/<[^>]*>/g, '').substring(0, 120) || 'Direct B2B wholesale hardware catalog item with volume discount price tiers.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Status Notification */}
        {formStatus && (
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${formStatus.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
            {formStatus.success ? (
              <>
                <Check className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-950">Success</div>
                  <div className="text-[11px] mt-0.5">{formStatus.message}</div>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-950">Error saving catalog details</div>
                  <div className="text-[11px] mt-0.5">{formStatus.message}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={(media) => {
          const fullUrl = media.url?.startsWith('http')
            ? media.url
            : `${API_URL}${media.url?.startsWith('/') ? '' : '/'}${media.url}`;
          if (mediaModalTarget === 'seo') {
            setMetaImage(fullUrl);
          } else {
            if (!images.includes(fullUrl)) {
              setImages(prev => [...prev, fullUrl]);
            }
          }
        }}
        authToken={userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || ''}
      />
    </>
  );
}
