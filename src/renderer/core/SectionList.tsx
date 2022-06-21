import { Flex, Txt } from '@mtyk/frontend/core/components'
import React from 'react'

export interface SectionListProps<T> {
  sections: { data: T[]; section: string }[]
  ItemComponent: React.ComponentType<{ item: T }>
}

export default function SectionList<T>(props: SectionListProps<T>) {
  const { sections, ItemComponent } = props
  return (
    <Flex flexDirection="column">
      {sections.map(({ section, data }) => {
        return (
          <Flex key={section}>
            <Txt medium>{section}</Txt>
            {data.map(item => {
              return <ItemComponent key={item} item={item} />
            })}
          </Flex>
        )
      })}
    </Flex>
  )
}
