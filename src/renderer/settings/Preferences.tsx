import React from 'react'
// import { styled } from 'linaria/react'
// import { ContactDetails } from '../core/ContactDetails'

// const PreferencesWrap = styled.div`
//     color: white;
//     position: relative;
//     .title {

//     }
// `

const PrefTab = ({children, title}) => {
    return <div>
        { children }
    </div>
}

const PrefItem = ({ title, help, children }) => {



}

export const Preferences = () => {
    // find out if setup complete
    return <div></div>
    // return <PreferencesWrap>
    //     <div className="title">Preferences</div>
    //     <PrefTab title="General">
    //         Show notifications when triggering actions

    //         User Mod library Location
    //         <PrefItem title={`User Mod Library Location`}>
                
    //         </PrefItem>
    //     </PrefTab>
    //     <PrefTab title="Bitwig">
    //         Show notifications when triggering actions
            
    //     <PrefTab/>

    //     <ContactDetails style={{position: 'absolute', right: '1rem', bottom: '1rem'}} />
    // </PreferencesWrap>
}