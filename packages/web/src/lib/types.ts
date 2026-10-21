export type Maturity = 'stable' | 'beta' | 'experimental';

export interface Author {
  name: string;
  github?: string;
  email?: string;
  url?: string;
}

export interface SkillSummary {
  slug: string;
  name: string;
  version: string;
  /** SKILL.md frontmatter description, verbatim. */
  description: string;
  /** Hub abstract per site language. */
  descriptions: { en: string; zh: string };
  maturity: Maturity;
  license: string | null;
  author: Author | null;
  tags: string[];
  cover: string | null;
  zip: string;
  sha256: string;
  size: number;
}

export interface SkillDetail extends SkillSummary {
  homepage: string | null;
  links: { repo?: string; docs?: string; issues?: string } | null;
  screenshots: string[];
  markdown: string;
  installDeepLink: string;
  zipAbsoluteUrl: string;
  skillFrontmatter: Record<string, unknown>;
}

export interface RegistryIndex {
  generatedAt: string;
  count: number;
  skills: SkillSummary[];
}

export interface FacetValue {
  id: string;
  label: { en: string; zh: string };
}

export interface Facet {
  id: string;
  namespace: string;
  label: { en: string; zh: string };
  values: FacetValue[];
}

export interface Taxonomy {
  defaults?: Record<string, string>;
  facets: Facet[];
}
