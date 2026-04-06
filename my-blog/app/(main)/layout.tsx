import SectionContainer from '@/components/SectionContainer'
import { ReactNode } from 'react'
import { SearchProvider, SearchConfig } from 'pliny/search'
import siteMetadata from '@/data/siteMetadata'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SectionContainer>
      <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
        <main className="mb-auto pt-20 sm:pt-24">{children}</main>
      </SearchProvider>
    </SectionContainer>
  )
}