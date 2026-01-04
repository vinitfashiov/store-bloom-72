// Page Builder Types

export type BlockType = 
  | 'hero'
  | 'products'
  | 'categories'
  | 'brands'
  | 'customHtml'
  | 'text'
  | 'image'
  | 'video'
  | 'testimonial'
  | 'feature'
  | 'cta'
  | 'spacer';

export interface BlockStyles {
  width?: string;
  height?: string;
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  styles: BlockStyles;
  order: number;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  data: {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaUrl: string;
    overlay?: boolean;
  };
}

export interface ProductsBlock extends BaseBlock {
  type: 'products';
  data: {
    title: string;
    subtitle?: string;
    collection: 'featured' | 'recent' | 'best_sellers' | 'trending';
    limit: number;
    layout: 'grid' | 'carousel';
  };
}

export interface CategoriesBlock extends BaseBlock {
  type: 'categories';
  data: {
    title: string;
    subtitle?: string;
    limit: number;
    layout: 'grid' | 'carousel';
  };
}

export interface BrandsBlock extends BaseBlock {
  type: 'brands';
  data: {
    title: string;
    subtitle?: string;
    limit: number;
    layout: 'grid' | 'carousel';
  };
}

export interface CustomHtmlBlock extends BaseBlock {
  type: 'customHtml';
  data: {
    html: string;
    css: string;
  };
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  data: {
    content: string;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    imageUrl: string;
    alt: string;
    linkUrl?: string;
  };
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  data: {
    videoUrl: string;
    thumbnailUrl?: string;
    autoplay?: boolean;
  };
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  data: {
    quote: string;
    author: string;
    authorTitle?: string;
    avatarUrl?: string;
  };
}

export interface FeatureBlock extends BaseBlock {
  type: 'feature';
  data: {
    title: string;
    description: string;
    icon?: string;
    features: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

export interface CtaBlock extends BaseBlock {
  type: 'cta';
  data: {
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonUrl: string;
    backgroundColor?: string;
  };
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  data: {
    height: string;
  };
}

export type PageBuilderBlock = 
  | HeroBlock
  | ProductsBlock
  | CategoriesBlock
  | BrandsBlock
  | CustomHtmlBlock
  | TextBlock
  | ImageBlock
  | VideoBlock
  | TestimonialBlock
  | FeatureBlock
  | CtaBlock
  | SpacerBlock;

export interface HomepageLayout {
  sections: PageBuilderBlock[];
}
