import React, { useState, useEffect, useRef } from 'react';
import { userStore } from '../../store/authStore.js';
import { 
  Plus, Trash2, X, Check, ChevronLeft, Link, Image, Tag, Folder,
  Search, ChevronDown, CheckSquare, Square, Info, ShieldAlert, Package,
  MapPin, HelpCircle, RefreshCw, Layers, GitBranch
} from 'lucide-react';
import { getMockProducts, saveMockProduct } from '../../utils/mockDb.js';

const DEFAULT_WAREHOUSES = [
  { code: 'MUM-01', name: 'Mumbai Central' },
  { code: 'DEL-01', name: 'Delhi Hub' },
  { code: 'BLR-01', name: 'Bengaluru Depot' }
];

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

  // Shipping state
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
  const [warehouseStocks, setWarehouseStocks] = useState(DEFAULT_WAREHOUSES.map(w => ({ warehouseCode: w.code, stock: 0 })));
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

  const handleConfirmAddCategory = () => {
    const nameTrimmed = newCategoryName.trim();
    if (!nameTrimmed) {
      alert('Category name is required.');
      return;
    }

    setCategoryTree(prev => {
      if (!newCategoryParent) {
        if (prev.some(c => c.name === nameTrimmed)) return prev;
        return [...prev, { name: nameTrimmed, children: [] }];
      }
      return addChildToParent(prev, newCategoryParent, nameTrimmed);
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
          const mockProducts = getMockProducts();
          const product = mockProducts.find(p => p.id === productId);
          if (!product) {
            throw new Error('Product not found in static catalog');
          }

          setName(product.name);
          setDescription(product.description || '');
          setSlug(product.slug || '');
          setIsActive(product.isActive);
          const catString = product.category || '';
          const catList = catString.split(',').map(s => s.trim()).filter(s => s !== '');
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
          setTags(product.tags || []);
          setImages(product.images || []);

          // Load from new pricingConfigurations structure
          const cfg = product.pricingConfigurations?.[0];
          if (cfg) {
            setSku(product.sku || '');
            
            const whStocks = DEFAULT_WAREHOUSES.map(wh => {
              const matched = cfg.warehouseStocks?.find(ws => ws.warehouseCode === wh.code);
              return {
                warehouseCode: wh.code,
                stock: matched ? matched.stock : 0
              };
            });
            setWarehouseStocks(whStocks);

            const mappedPrices = DEFAULT_PRICE_GROUPS.map(pg => {
              const matched = cfg.pricestiers?.find(p => p.priceGroup === pg);
              return {
                priceGroup: pg,
                price: matched ? matched.price : '',
                compare_at_price: matched?.compare_at_price || '',
                tiers: matched?.tiers ? matched.tiers.map(t => ({ minQuantity: t.minQuantity, price: t.price })) : []
              };
            });
            setPrices(mappedPrices);
          } else if (product.variants && product.variants.length > 0) {
            // Fallback: old variants structure
            const firstVar = product.variants[0];
            setSku(firstVar.sku || '');
            
            const whStocks = DEFAULT_WAREHOUSES.map(wh => {
              const matched = firstVar.warehouseStocks?.find(ws => ws.warehouseCode === wh.code);
              return {
                warehouseCode: wh.code,
                stock: matched ? matched.stock : 0
              };
            });
            setWarehouseStocks(whStocks);

            const mappedPrices = DEFAULT_PRICE_GROUPS.map(pg => {
              const matched = firstVar.prices?.find(p => p.priceGroup === pg);
              return {
                priceGroup: pg,
                price: matched ? matched.price : '',
                compare_at_price: matched?.compare_at_price || '',
                tiers: matched?.tiers ? matched.tiers.map(t => ({ minQuantity: t.minQuantity, price: t.price })) : []
              };
            });
            setPrices(mappedPrices);
          }
        } catch (err) {
          console.error(err);
          setError(err.message || 'Error loading product');
        } finally {
          setIsLoading(false);
        }
      };
      loadProduct();
    } else {
      // Create empty default variant mapping if adding
      setSku('');
      setWarehouseStocks(DEFAULT_WAREHOUSES.map(w => ({ warehouseCode: w.code, stock: 0 })));
      setPrices(DEFAULT_PRICE_GROUPS.map(pg => ({ priceGroup: pg, price: '', compare_at_price: '', tiers: [] })));
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

    // Compile B2B Product details for static catalog (new pricingConfigurations schema)
    const savedProd = {
      id: productId || `prod-${Date.now()}`,
      name,
      description,
      slug,
      images,
      category: selectedCategories.length > 0 ? selectedCategories.join(', ') : null,
      tags,
      isActive,
      sku,
      pricingConfigurations: [
        {
          totalStock: warehouseStocks.reduce((sum, ws) => sum + (ws.stock || 0), 0),
          warehouseStocks: warehouseStocks.map(ws => ({
            warehouseCode: ws.warehouseCode,
            warehouseName: ws.warehouseName || ws.warehouseCode,
            stock: ws.stock
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
      saveMockProduct(savedProd);

      setFormStatus({
        success: true,
        message: `B2B Product '${name}' saved successfully (Local Storage)!`
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

      {/* Main Shopify Grid Structure */}
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
                placeholder="Short sleeve t-shirt"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-shadow bg-slate-50 hover:bg-slate-50/50"
              />
            </div>

            {/* WordPress/Shopify style Slug UI */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pb-2 px-1">
              <span className="font-semibold text-slate-600">Slug:</span>
              {!isEditingSlug ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`/products/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-mono text-[11px]"
                  >
                    http://localhost:4321/products/{slug || 'product-handle'}/
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSlug(true);
                      setSlugInputValue(slug);
                    }}
                    className="px-2 py-0.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-[10px] font-bold transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-400">http://localhost:4321/products/</span>
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
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(false)}
                    className="px-2 py-0.5 text-slate-400 hover:text-slate-650 text-[10px] font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product descriptions..."
                className="w-full h-32 p-3.5 border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-shadow bg-slate-50 hover:bg-slate-50/50"
              />
            </div>
          </div>

          {/* Card 2: Media / Images Upload */}
          <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Image className="w-4 h-4 text-slate-400" /> Media
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageInputText}
                  onChange={(e) => setImageInputText(e.target.value)}
                  onKeyDown={handleImageAddKeyPress}
                  placeholder="Paste image URL and press Enter..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => handleImageAddKeyPress({ key: 'Enter', preventDefault: () => {} })}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Thumbnails grid */}
              {images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={img}
                        alt="Product visual"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute right-1.5 top-1.5 p-1 bg-white hover:bg-rose-50 text-rose-500 rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-slate-50">
                  <Image className="w-8 h-8 text-slate-300" />
                  <div>No product photos added. Paste Unsplash or CDN media links above.</div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Shipping */}
          <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" /> Shipping
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
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    {/* Dimensions (L x W x H) (cm) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        Dimensions (L×W×H) (cm)
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Length x Width x Height in centimeters" />
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
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Shipping classes are used by certain shipping gateways to group products" />
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

                {/* Country of Origin and HS Code button */}
                <div className="border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowShippingDetails(!showShippingDetails)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
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
              <div className="text-[10px] text-slate-400 italic">Product pricing configuration</div>
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
                <label className="text-xs font-bold text-slate-700 uppercase">Warehouse stock levels</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {warehouseStocks.map((ws, wsIdx) => (
                    <div key={ws.warehouseCode} className="flex flex-col bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-505">{ws.warehouseCode}</span>
                      <input
                        type="number"
                        min="0"
                        value={ws.stock}
                        onChange={(e) => handleStockChange(wsIdx, e.target.value)}
                        className="w-full border-none focus:outline-none text-xs font-mono text-center font-bold mt-1 bg-transparent"
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
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-50 text-[10px] font-bold transition-all shadow-sm"
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
                            className={`w-24 px-2.5 py-1 border rounded-lg text-xs font-mono focus:outline-none text-right bg-white ${
                              pr.compare_at_price && parseFloat(pr.compare_at_price) <= parseFloat(pr.price || 0)
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
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
        </div>

        {/* Right Column (Sidebar Information Cards) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 0: Product Type */}
          <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" /> Product Type
            </h3>

            {/* Simple / Variation toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setProductType('simple'); setLinkedProducts([]); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  productType === 'simple'
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
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  productType === 'variation'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <GitBranch className="w-5 h-5" />
                Variation
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              {productType === 'simple'
                ? 'A standalone B2B product with its own SKU, warehouse stock, and pricing configuration.'
                : 'A grouped product that links to other simple products as variation options (e.g. different sizes or colors).'}
            </p>

            {/* Variation search — only shown when type = variation */}
            {productType === 'variation' && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700">Linked Products</div>

                {/* Selected linked products */}
                {linkedProducts.length > 0 && (
                  <div className="space-y-1.5">
                    {linkedProducts.map(lp => (
                      <div key={lp.id} className="flex items-center justify-between gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-indigo-900 truncate">{lp.name}</div>
                            <div className="text-[10px] font-mono text-indigo-400">{lp.sku || 'No SKU'}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLinkedProducts(prev => prev.filter(p => p.id !== lp.id))}
                          className="p-1 text-indigo-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search input + dropdown */}
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
                      placeholder="Search products to link…"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {isVariationSearchOpen && (() => {
                    const allProducts = getMockProducts();
                    const results = allProducts.filter(p =>
                      p.id !== productId &&
                      !linkedProducts.some(lp => lp.id === p.id) &&
                      (variationSearch === '' || p.name.toLowerCase().includes(variationSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(variationSearch.toLowerCase()))
                    );
                    if (results.length === 0) return (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[11px] text-slate-400 text-center">
                        No other products found
                      </div>
                    );
                    return (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                        {results.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setLinkedProducts(prev => [...prev, p]);
                              setVariationSearch('');
                              setIsVariationSearchOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left group border-b border-slate-50 last:border-none"
                          >
                            <div className="p-1.5 bg-slate-100 group-hover:bg-indigo-100 rounded-lg shrink-0 transition-colors">
                              <GitBranch className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate">{p.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{p.sku || 'No SKU'}</div>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 ml-auto shrink-0" />
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {linkedProducts.length === 0 && (
                  <p className="text-[10px] text-slate-400">Search and add products that are variations of this product.</p>
                )}
              </div>
            )}
          </div>

          {/* Card 1: Product Status */}
          <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Product status</label>
            <div className="relative">
              <select
                value={isActive ? 'Active' : 'Draft'}
                onChange={(e) => setIsActive(e.target.value === 'Active')}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-xs bg-slate-50 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Active products will be cataloged dynamically into the storefront list, allowing real-time ordering and fallback B2B pricing group resolution.
            </p>
          </div>

          {/* Card 2: Product Organization (Category & Tags) */}
          <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product organization</h3>
            
            {/* Custom Category dropdown with Hierarchical Search/Checkboxes */}
            <div className="space-y-2" ref={categoryRef}>
              <label className="text-xs font-bold text-slate-600 block">Categories</label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-left text-xs bg-slate-50 flex items-center justify-between hover:bg-slate-100/50 transition-colors shadow-sm"
                >
                  <span className="text-slate-700 truncate max-w-[200px]">
                    {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Select categories'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Popover content matching the requested UI screenshot */}
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
                        placeholder="Search or add category"
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
                                className="w-full flex items-center gap-2 py-0.5 text-left text-xs text-slate-700 hover:text-slate-900 transition-colors group"
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

                    {/* Add new category button/link & mini-form matching screenshot */}
                    {!showCreateCategoryForm ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateCategoryForm(true);
                          setNewCategoryName(categorySearch);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-100 w-full text-left"
                      >
                        + Add new category
                      </button>
                    ) : (
                      <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
                        {/* New Category Name Input */}
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category name"
                          className="w-full px-2.5 py-1.5 border border-slate-355 rounded-lg text-xs bg-white focus:outline-none"
                        />

                        {/* Parent Category Select */}
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

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleConfirmAddCategory}
                            className="px-3 py-1.5 bg-white border border-blue-600 hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-xs transition-colors"
                          >
                            Add new category
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateCategoryForm(false);
                              setNewCategoryName('');
                              setNewCategoryParent('');
                            }}
                            className="px-2 py-1.5 text-slate-400 hover:text-slate-650 text-xs font-semibold"
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

            {/* Shopify style tags picker matching screenshot */}
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
                      className="text-slate-400 hover:text-slate-800"
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

      {/* Form Status Notification */}
      {formStatus && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
          formStatus.success 
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
  );
}
