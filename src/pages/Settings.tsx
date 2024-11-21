import { useState, useEffect } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { UnsavedChangesModal } from '../components/UnsavedChangesModal';
import { useSettingsStore } from '../stores/settingsStore';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const categories = [
  { id: 'dings', label: 'Dings' },
  { id: 'fins', label: 'Fins' },
  { id: 'options', label: 'Options' },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('dings');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newType, setNewType] = useState({
    name: '',
    category: 'dings',
    pricePolyester: 0,
    priceEpoxy: 0,
    color: '#2196F3',
  });

  const { repairTypes, addRepairType, updateRepairType, deleteRepairType } = useSettingsStore();

  // Update newType category when activeCategory changes
  useEffect(() => {
    setNewType(prev => ({
      ...prev,
      category: activeCategory
    }));
  }, [activeCategory]);

  useBeforeUnload((event) => {
    if (hasChanges) {
      event.preventDefault();
      return '';
    }
  });

  const handleAddType = () => {
    if (!newType.name) return;
    
    addRepairType({
      ...newType,
      category: activeCategory
    });
    
    setNewType({
      name: '',
      category: activeCategory,
      pricePolyester: 0,
      priceEpoxy: 0,
      color: '#2196F3',
    });
    setHasChanges(true);
  };

  const handleUpdateType = (id: string, updates: any) => {
    updateRepairType(id, updates);
    setHasChanges(true);
  };

  const handleDeleteType = (id: string) => {
    deleteRepairType(id);
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const filteredTypes = repairTypes.filter((type) => type.category === activeCategory);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <button
          onClick={handleSave}
          className={clsx(
            'px-4 py-2',
            hasChanges
              ? 'bg-[#45b7d1] text-white hover:bg-[#3da1b9]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
          disabled={!hasChanges}
        >
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={clsx(
              'px-4 py-2',
              activeCategory === category.id
                ? 'bg-[#45b7d1] text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Add New {activeCategory} Type</h2>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <input
                type="text"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                placeholder="Name"
                className="input-primary w-full"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={newType.pricePolyester}
                onChange={(e) =>
                  setNewType({ ...newType, pricePolyester: Number(e.target.value) })
                }
                placeholder="Polyester €"
                className="input-primary w-full"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={newType.priceEpoxy}
                onChange={(e) => setNewType({ ...newType, priceEpoxy: Number(e.target.value) })}
                placeholder="Epoxy €"
                className="input-primary w-full"
              />
            </div>
            <div className="col-span-2">
              <input
                type="color"
                value={newType.color}
                onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                className="h-9 w-full border border-gray-600 bg-gray-700"
              />
            </div>
            <div className="col-span-1">
              <button
                onClick={handleAddType}
                className="bg-[#45b7d1] text-white p-2 hover:bg-[#3da1b9] w-full flex items-center justify-center"
                title="Add Type"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Existing Types</h2>
          <div className="grid grid-cols-12 gap-4 font-semibold mb-2 text-gray-300">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Polyester €</div>
            <div className="col-span-2">Epoxy €</div>
            <div className="col-span-2">Color</div>
            <div className="col-span-1">Actions</div>
          </div>
          {filteredTypes.map((type) => (
            <div key={type.id} className="grid grid-cols-12 gap-4 mb-2">
              <div className="col-span-5">
                <input
                  type="text"
                  value={type.name}
                  onChange={(e) => handleUpdateType(type.id, { name: e.target.value })}
                  className="input-primary w-full"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={type.pricePolyester}
                  onChange={(e) =>
                    handleUpdateType(type.id, { pricePolyester: Number(e.target.value) })
                  }
                  className="input-primary w-full"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={type.priceEpoxy}
                  onChange={(e) =>
                    handleUpdateType(type.id, { priceEpoxy: Number(e.target.value) })
                  }
                  className="input-primary w-full"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="color"
                  value={type.color}
                  onChange={(e) => handleUpdateType(type.id, { color: e.target.value })}
                  className="h-9 w-full border border-gray-600 bg-gray-700"
                />
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => handleDeleteType(type.id)}
                  className="bg-red-600 text-white p-2 hover:bg-red-700 w-full flex items-center justify-center"
                  title="Delete Type"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUnsavedModal && (
        <UnsavedChangesModal
          onConfirm={() => {
            setShowUnsavedModal(false);
            setHasChanges(false);
            navigate(-1);
          }}
          onCancel={() => setShowUnsavedModal(false)}
        />
      )}
    </div>
  );
};

export default Settings;