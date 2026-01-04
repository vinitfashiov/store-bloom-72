import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  X, 
  Edit2,
  Type,
  Image as ImageIcon,
  Package,
  Tag,
  Award,
  Code,
  Video,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Minus
} from 'lucide-react';
import { PageBuilderBlock, BlockType, HomepageLayout } from '@/types/pageBuilder';
import { v4 as uuidv4 } from 'uuid';
import { BlockContentEditor } from '@/components/pageBuilder/BlockEditors';

interface AdminPageBuilderProps {
  tenantId: string;
  disabled?: boolean;
}

// Block Library Component
const BlockLibrary = ({ onAddBlock }: { onAddBlock: (type: BlockType) => void }) => {
  const blocks: Array<{ type: BlockType; label: string; icon: any; description: string }> = [
    { type: 'hero', label: 'Hero Banner', icon: Sparkles, description: 'Large banner with image and CTA' },
    { type: 'products', label: 'Products', icon: Package, description: 'Display product collection' },
    { type: 'categories', label: 'Categories', icon: Tag, description: 'Show product categories' },
    { type: 'brands', label: 'Brands', icon: Award, description: 'Display brand logos' },
    { type: 'text', label: 'Text', icon: Type, description: 'Rich text content' },
    { type: 'image', label: 'Image', icon: ImageIcon, description: 'Single image block' },
    { type: 'customHtml', label: 'Custom HTML/CSS', icon: Code, description: 'Add custom HTML and CSS' },
    { type: 'cta', label: 'Call to Action', icon: ArrowRight, description: 'CTA section' },
    { type: 'spacer', label: 'Spacer', icon: Minus, description: 'Add vertical space' },
  ];

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-sm font-semibold mb-3">Add Blocks</h3>
      {blocks.map((block) => {
        const Icon = block.icon;
        return (
          <button
            key={block.type}
            onClick={() => onAddBlock(block.type)}
            className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded bg-primary/10 group-hover:bg-primary/20">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{block.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{block.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Styling Controls Component
const StylingControls = ({ 
  block, 
  onUpdate 
}: { 
  block: PageBuilderBlock; 
  onUpdate: (styles: PageBuilderBlock['styles']) => void;
}) => {
  const styles = block.styles || {};

  const updateStyle = (key: keyof typeof styles, value: any) => {
    onUpdate({ ...styles, [key]: value });
  };

  const updatePadding = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const padding = styles.padding || {};
    updateStyle('padding', { ...padding, [side]: value });
  };

  const updateMargin = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const margin = styles.margin || {};
    updateStyle('margin', { ...margin, [side]: value });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Dimensions</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="text"
                value={styles.width || ''}
                onChange={(e) => updateStyle('width', e.target.value)}
                placeholder="100%"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="text"
                value={styles.height || ''}
                onChange={(e) => updateStyle('height', e.target.value)}
                placeholder="auto"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Padding</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Top</Label>
              <Input
                type="text"
                value={styles.padding?.top || ''}
                onChange={(e) => updatePadding('top', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Right</Label>
              <Input
                type="text"
                value={styles.padding?.right || ''}
                onChange={(e) => updatePadding('right', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Bottom</Label>
              <Input
                type="text"
                value={styles.padding?.bottom || ''}
                onChange={(e) => updatePadding('bottom', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Left</Label>
              <Input
                type="text"
                value={styles.padding?.left || ''}
                onChange={(e) => updatePadding('left', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Margin</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Top</Label>
              <Input
                type="text"
                value={styles.margin?.top || ''}
                onChange={(e) => updateMargin('top', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Right</Label>
              <Input
                type="text"
                value={styles.margin?.right || ''}
                onChange={(e) => updateMargin('right', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Bottom</Label>
              <Input
                type="text"
                value={styles.margin?.bottom || ''}
                onChange={(e) => updateMargin('bottom', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Left</Label>
              <Input
                type="text"
                value={styles.margin?.left || ''}
                onChange={(e) => updateMargin('left', e.target.value)}
                placeholder="0px"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Background</Label>
          <Input
            type="text"
            value={styles.backgroundColor || ''}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            placeholder="#ffffff"
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold mb-2 block">Text Align</Label>
          <Select
            value={styles.textAlign || 'left'}
            onValueChange={(value: 'left' | 'center' | 'right') => updateStyle('textAlign', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ScrollArea>
  );
};

// Sortable Block Item
const SortableBlockItem = ({
  block,
  isSelected,
  onSelect,
  onDelete,
  children
}: {
  block: PageBuilderBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing ${isSelected ? 'opacity-100' : ''}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-primary" />
      </div>
      <div className="ml-8 border border-border rounded-lg bg-background">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function AdminPageBuilder({ tenantId, disabled }: AdminPageBuilderProps) {
  const queryClient = useQueryClient();
  const [selectedBlock, setSelectedBlock] = useState<PageBuilderBlock | null>(null);
  const [blocks, setBlocks] = useState<PageBuilderBlock[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch layout
  const { data: layoutData, isLoading } = useQuery({
    queryKey: ['homepage-layout', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_layouts')
        .select('layout_data')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw error;
      return data?.layout_data || { sections: [] };
    },
  });

  useEffect(() => {
    if (layoutData) {
      setBlocks(layoutData.sections || []);
    }
  }, [layoutData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (layout: HomepageLayout) => {
      const { error } = await supabase
        .from('homepage_layouts')
        .upsert({
          tenant_id: tenantId,
          layout_data: layout,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Layout saved successfully');
      queryClient.invalidateQueries({ queryKey: ['homepage-layout', tenantId] });
    },
    onError: (error: any) => {
      toast.error('Failed to save layout: ' + error.message);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index,
      }));
      setBlocks(newBlocks);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createDefaultBlock(type, blocks.length);
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedBlock(newBlock);
  };

  const handleDeleteBlock = (id: string) => {
    const newBlocks = blocks.filter((b) => b.id !== id).map((block, index) => ({
      ...block,
      order: index,
    }));
    setBlocks(newBlocks);
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  };

  const handleUpdateBlock = (id: string, updates: Partial<PageBuilderBlock>) => {
    const newBlocks = blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
    if (selectedBlock?.id === id) {
      setSelectedBlock({ ...selectedBlock, ...updates } as PageBuilderBlock);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({ sections: blocks });
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Card className="m-4 mb-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Page Builder</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop blocks to customize your homepage
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handleSave} disabled={disabled || saveMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex gap-4 p-4 pt-0 overflow-hidden">
        {/* Block Library Sidebar */}
        {!previewMode && (
          <Card className="w-64 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Block Library</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <BlockLibrary onAddBlock={handleAddBlock} />
            </CardContent>
          </Card>
        )}

        {/* Canvas */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 p-4 overflow-auto">
            {previewMode ? (
              <div className="space-y-4">
                {blocks.map((block) => (
                  <BlockPreview key={block.id} block={block} />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {blocks.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No blocks yet. Add blocks from the library to get started.</p>
                      </div>
                    )}
                    {blocks.map((block) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        isSelected={selectedBlock?.id === block.id}
                        onSelect={() => setSelectedBlock(block)}
                        onDelete={() => handleDeleteBlock(block.id)}
                      >
                        <BlockEditor
                          block={block}
                          onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                        />
                      </SortableBlockItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Properties Panel */}
        {!previewMode && selectedBlock && (
          <Card className="w-80 shrink-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Properties</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBlock(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full rounded-none">
                  <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                  <TabsTrigger value="styles" className="flex-1">Styles</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-0">
                  <BlockContentEditor
                    block={selectedBlock}
                    onUpdate={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
                  />
                </TabsContent>
                <TabsContent value="styles" className="mt-0">
                  <StylingControls
                    block={selectedBlock}
                    onUpdate={(styles) => handleUpdateBlock(selectedBlock.id, { styles })}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to create default blocks
function createDefaultBlock(type: BlockType, order: number): PageBuilderBlock {
  const id = uuidv4();
  const baseBlock = {
    id,
    order,
    styles: {},
  };

  switch (type) {
    case 'hero':
      return {
        ...baseBlock,
        type: 'hero',
        data: {
          title: 'Welcome to Our Store',
          subtitle: 'Discover amazing products',
          imageUrl: '',
          ctaText: 'Shop Now',
          ctaUrl: '/products',
        },
      };
    case 'products':
      return {
        ...baseBlock,
        type: 'products',
        data: {
          title: 'Featured Products',
          collection: 'featured',
          limit: 8,
          layout: 'grid',
        },
      };
    case 'categories':
      return {
        ...baseBlock,
        type: 'categories',
        data: {
          title: 'Shop by Category',
          limit: 8,
          layout: 'grid',
        },
      };
    case 'brands':
      return {
        ...baseBlock,
        type: 'brands',
        data: {
          title: 'Our Brands',
          limit: 8,
          layout: 'carousel',
        },
      };
    case 'customHtml':
      return {
        ...baseBlock,
        type: 'customHtml',
        data: {
          html: '<div>Custom HTML</div>',
          css: 'div { color: #000; }',
        },
      };
    case 'text':
      return {
        ...baseBlock,
        type: 'text',
        data: {
          content: 'Enter your text here',
        },
      };
    case 'image':
      return {
        ...baseBlock,
        type: 'image',
        data: {
          imageUrl: '',
          alt: 'Image',
        },
      };
    case 'cta':
      return {
        ...baseBlock,
        type: 'cta',
        data: {
          title: 'Call to Action',
          buttonText: 'Get Started',
          buttonUrl: '/',
        },
      };
    case 'spacer':
      return {
        ...baseBlock,
        type: 'spacer',
        data: {
          height: '50px',
        },
      };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

// Placeholder components (to be implemented)
function BlockEditor({ block, onUpdate }: { block: PageBuilderBlock; onUpdate: (updates: Partial<PageBuilderBlock>) => void }) {
  return (
    <div className="p-4 min-h-[100px] bg-muted/30 border-dashed border-2">
      <div className="text-sm text-muted-foreground">
        {block.type} Block (ID: {block.id.slice(0, 8)}...)
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: PageBuilderBlock }) {
  return (
    <div className="p-4 min-h-[100px] bg-muted/30">
      <div className="text-sm">{block.type} Block Preview</div>
    </div>
  );
}
