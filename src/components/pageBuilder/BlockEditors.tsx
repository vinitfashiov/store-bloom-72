import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageBuilderBlock } from '@/types/pageBuilder';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlockContentEditorProps {
  block: PageBuilderBlock;
  onUpdate: (updates: Partial<PageBuilderBlock>) => void;
}

export function BlockContentEditor({ block, onUpdate }: BlockContentEditorProps) {
  const updateData = (data: any) => {
    onUpdate({ data: { ...(block as any).data, ...data } });
  };

  switch (block.type) {
    case 'hero':
      const heroData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={heroData?.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Welcome to Our Store"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={heroData?.subtitle || ''}
                onChange={(e) => updateData({ subtitle: e.target.value })}
                placeholder="Discover amazing products"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={heroData?.imageUrl || ''}
                onChange={(e) => updateData({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={heroData?.ctaText || ''}
                onChange={(e) => updateData({ ctaText: e.target.value })}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <Label>CTA Button URL</Label>
              <Input
                value={heroData?.ctaUrl || ''}
                onChange={(e) => updateData({ ctaUrl: e.target.value })}
                placeholder="/products"
              />
            </div>
          </div>
        </ScrollArea>
      );

    case 'products':
      const productsData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={productsData?.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Featured Products"
              />
            </div>
            <div>
              <Label>Subtitle (Optional)</Label>
              <Input
                value={productsData?.subtitle || ''}
                onChange={(e) => updateData({ subtitle: e.target.value })}
                placeholder="Discover our best products"
              />
            </div>
            <div>
              <Label>Collection</Label>
              <Select
                value={productsData?.collection || 'featured'}
                onValueChange={(value) => updateData({ collection: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="best_sellers">Best Sellers</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Limit</Label>
              <Input
                type="number"
                value={productsData?.limit || 8}
                onChange={(e) => updateData({ limit: parseInt(e.target.value) || 8 })}
                min={1}
                max={50}
              />
            </div>
            <div>
              <Label>Layout</Label>
              <Select
                value={productsData?.layout || 'grid'}
                onValueChange={(value) => updateData({ layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      );

    case 'categories':
      const categoriesData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={categoriesData?.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Shop by Category"
              />
            </div>
            <div>
              <Label>Subtitle (Optional)</Label>
              <Input
                value={categoriesData?.subtitle || ''}
                onChange={(e) => updateData({ subtitle: e.target.value })}
                placeholder="Browse our categories"
              />
            </div>
            <div>
              <Label>Limit</Label>
              <Input
                type="number"
                value={categoriesData?.limit || 8}
                onChange={(e) => updateData({ limit: parseInt(e.target.value) || 8 })}
                min={1}
                max={50}
              />
            </div>
            <div>
              <Label>Layout</Label>
              <Select
                value={categoriesData?.layout || 'grid'}
                onValueChange={(value) => updateData({ layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      );

    case 'brands':
      const brandsData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={brandsData?.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Our Brands"
              />
            </div>
            <div>
              <Label>Subtitle (Optional)</Label>
              <Input
                value={brandsData?.subtitle || ''}
                onChange={(e) => updateData({ subtitle: e.target.value })}
                placeholder="Shop by brand"
              />
            </div>
            <div>
              <Label>Limit</Label>
              <Input
                type="number"
                value={brandsData?.limit || 8}
                onChange={(e) => updateData({ limit: parseInt(e.target.value) || 8 })}
                min={1}
                max={50}
              />
            </div>
            <div>
              <Label>Layout</Label>
              <Select
                value={brandsData?.layout || 'carousel'}
                onValueChange={(value) => updateData({ layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      );

    case 'customHtml':
      const customHtmlData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
                <TabsTrigger value="css" className="flex-1">CSS</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="mt-4">
                <Label>HTML Code</Label>
                <Textarea
                  value={customHtmlData?.html || ''}
                  onChange={(e) => updateData({ html: e.target.value })}
                  placeholder="<div>Your HTML code here</div>"
                  className="font-mono text-xs min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your HTML code. You can use any valid HTML tags.
                </p>
              </TabsContent>
              <TabsContent value="css" className="mt-4">
                <Label>CSS Code</Label>
                <Textarea
                  value={customHtmlData?.css || ''}
                  onChange={(e) => updateData({ css: e.target.value })}
                  placeholder=".custom-class { color: #000; }"
                  className="font-mono text-xs min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your CSS code. Styles will be scoped to this block.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      );

    case 'text':
      const textData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Content</Label>
              <Textarea
                value={textData?.content || ''}
                onChange={(e) => updateData({ content: e.target.value })}
                placeholder="Enter your text here"
                className="min-h-[200px]"
              />
            </div>
            <div>
              <Label>Font Size</Label>
              <Input
                value={textData?.fontSize || ''}
                onChange={(e) => updateData({ fontSize: e.target.value })}
                placeholder="16px"
              />
            </div>
            <div>
              <Label>Font Weight</Label>
              <Select
                value={textData?.fontWeight || 'normal'}
                onValueChange={(value) => updateData({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Lighter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <Input
                value={textData?.color || ''}
                onChange={(e) => updateData({ color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>
        </ScrollArea>
      );

    case 'image':
      const imageData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={imageData?.imageUrl || ''}
                onChange={(e) => updateData({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={imageData?.alt || ''}
                onChange={(e) => updateData({ alt: e.target.value })}
                placeholder="Image description"
              />
            </div>
            <div>
              <Label>Link URL (Optional)</Label>
              <Input
                value={imageData?.linkUrl || ''}
                onChange={(e) => updateData({ linkUrl: e.target.value })}
                placeholder="/products"
              />
            </div>
          </div>
        </ScrollArea>
      );

    case 'cta':
      const ctaData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={ctaData?.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Call to Action"
              />
            </div>
            <div>
              <Label>Subtitle (Optional)</Label>
              <Input
                value={ctaData?.subtitle || ''}
                onChange={(e) => updateData({ subtitle: e.target.value })}
                placeholder="Get started today"
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={ctaData?.buttonText || ''}
                onChange={(e) => updateData({ buttonText: e.target.value })}
                placeholder="Get Started"
              />
            </div>
            <div>
              <Label>Button URL</Label>
              <Input
                value={ctaData?.buttonUrl || ''}
                onChange={(e) => updateData({ buttonUrl: e.target.value })}
                placeholder="/"
              />
            </div>
            <div>
              <Label>Background Color</Label>
              <Input
                value={ctaData?.backgroundColor || ''}
                onChange={(e) => updateData({ backgroundColor: e.target.value })}
                placeholder="#f3f4f6"
              />
            </div>
          </div>
        </ScrollArea>
      );

    case 'spacer':
      const spacerData = (block as any).data;
      return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <Label>Height</Label>
              <Input
                value={spacerData?.height || ''}
                onChange={(e) => updateData({ height: e.target.value })}
                placeholder="50px"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter height (e.g., 50px, 2rem, 100vh)
              </p>
            </div>
          </div>
        </ScrollArea>
      );

    default:
      return (
        <div className="p-4">
          <div className="text-sm text-muted-foreground">
            Content editor for {block.type} block
          </div>
        </div>
      );
  }
}
