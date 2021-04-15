import React, { useState } from 'react'
import { styled } from 'linaria/react'

const TabsWrap = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`
const Tab = styled.div`
    /* background: ${(props: any) => props.isActive ? `#555` : ``}; */
    color: ${(props: any) => props.isActive ? `white` : `#777`};
    padding: .3em .7em;
    cursor: pointer;
    font-size: .9em;
` as any
const Tabs = styled.div`
    display: inline-flex;
    transform: translateY(-50%);
    background: #373737;
    border-radius: .7em;
    overflow: hidden;
`
const TabContent = styled.div`
    position: absolute;
    top: 2em;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
`
export const TabbedView = ({ tabs, ...rest }) => {
    if (!tabs.length) {
        return null
    }
    const [currentTab, setTab] = useState(tabs[0].name)
    const actualCurrentTab = (tabs.find(t => t.name === currentTab) ?? tabs[0])
    const CurrentTabComponent = actualCurrentTab.component
    const onTabClick = (tab) => {
        setTab(tab.name)
    }

    return <TabsWrap {...rest}>
        <Tabs>
            {tabs.map(tab => {
                return <Tab isActive={actualCurrentTab.name === tab.name} onClick={() => onTabClick(tab)} key={tab.name}>
                    {tab.name}
                </Tab>
            })}
        </Tabs>
        <TabContent>
            <CurrentTabComponent />
        </TabContent>
    </TabsWrap>
}