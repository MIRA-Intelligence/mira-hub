import { getRegistry, getTaxonomy } from '@/lib/registry';
import { SkillsBrowser } from './SkillsBrowser';

export const metadata = {
  title: 'Skills · MIRA Hub',
};

export default function SkillsPage() {
  const registry = getRegistry();
  const taxonomy = getTaxonomy();
  return <SkillsBrowser skills={registry.skills} taxonomy={taxonomy} />;
}
