import { Flex, Txt } from '@mtyk/frontend/core/components'
import React from 'react'
import { renderWithTheme, ThemedPartRenderer } from '@mtyk/frontend/theming'
import { Idable } from '@mtyk/types'

export interface SectionListSection<Data> {
  section: string
  data: Data[]
}
export interface SectionListProps<T extends Idable, SectionType = SectionListSection<T>> {
  sections: SectionType[]
  hideEmptySections?: boolean
  renderSection?: ThemedPartRenderer<SectionType, { title: any; rows: any; key: string }>
  renderRow: ThemedPartRenderer<T, { key: string }>
}

export default function SectionList<T extends Idable>(props: SectionListProps<T>) {
  const { renderSection, renderRow, sections, hideEmptySections } = props
  return (
    <Flex>
      {sections.map(section => {
        const { section: title, data } = section
        if (hideEmptySections && data.length === 0) {
          return null
        }
        const rows = data.map(data => renderWithTheme(data, { key: data.id }, renderRow))
        return renderWithTheme(
          section,
          { rows, key: title, title: <Txt medium>{title}</Txt> },
          (section, props) => {
            return (
              <Flex>
                {props.title}
                <Flex>{props.rows}</Flex>
              </Flex>
            )
          },
          renderSection
        )
      })}
    </Flex>
  )
}
