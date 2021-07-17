import React from 'react'
import nookies from 'nookies'
import jwt from 'jsonwebtoken'

import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/components/lib/AluraKutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

function ProfileSidebar(props){
  return(
    <Box as="aside">
      <img src={`https://github.com/${props.githubUser}.png`} />
      
      <hr />
      <p>
        <a className="boxLink" href={`https://github.com/${props.githubUser}`}>
          @{props.githubUser}
        </a>
      </p>
      
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(props){
  return(
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">{props.title} ({props.items.length})</h2>
      <ul>
        {props.items.slice(0,6).map((itemAtual) => {
          return(
            <li key={itemAtual.id}>
              <a href={`https://github.com/${itemAtual.login}`} target="_blank" >
                <img src={`https://github.com/${itemAtual.login}.png`} />
                <span>{itemAtual.login}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const githubUser = props.githubUser
  const [communities, setCommunities] = React.useState([])
  const pessoasFavoritas = [
    'peas', 
    'omariosouto', 
    'marcobrunodev', 
    'rafaballerini',
    'felipefialho',
    'juunegreiros',
    'helderseixas',
  ]

  const [followers, setFollowers] = React.useState([])

  React.useEffect(() => {
    fetch('https://api.github.com/users/DenilsonMelo/followers')
    .then((responseServer) => {
      return responseServer.json()
    })
    .then((responseReady) => {
      setFollowers(responseReady)
    })

    //API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'a1f04843ae1487a159c9cf7d27221b',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ "query": `query {
        allCommunities{
          id
          title
          creatorSlug
          imageUrl
        }
      }` })
    })
    .then((response) => response.json())
    .then((responseFull) => {
      const communitiesDatoCms = responseFull.data.allCommunities
      setCommunities(communitiesDatoCms)
    })
  }, [])

  return (
    <>
      <AlurakutMenu githubUser={githubUser}/>
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar githubUser={githubUser}/>
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">Bem vindo(a), {githubUser}</h1>
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCreateComunity(event){
              event.preventDefault()
              const data = new FormData(event.target)

              const community = {
                title: data.get('title'),
                imageUrl: data.get('image'),
                creatorSlug: 'denilsonmelo',
              }

              fetch('/api/communities', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(community)
              }).then(async (response) => {
                const datas = await response.json()
                const community = datas.createRegister
                const updatedCommunities = [...communities, community]
                setCommunities(updatedCommunities)
              })

            }}>
              <div>
                <input 
                  placeholder="Qual vai ser o nome da sua comunidade?" 
                  name="title" 
                  aria-label="Qual vai ser o nome da sua comunidade?" 
                  type="text"
                />
              </div>
              <div>
                <input 
                  placeholder="Coloque uma URL para usarmos de capa" 
                  name="image" 
                  aria-label="Coloque uma URL para usarmos de capa" 
                />
              </div>

              <button>Criar comunidade</button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          <ProfileRelationsBox title="Seguidores" items={followers} />
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Pessoas da comunidade ({pessoasFavoritas.length})</h2>
            <ul>
              {pessoasFavoritas.slice(0,6).map((itemAtual) => {
                return(
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`} >
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Comunidades ({communities.length})</h2>
            <ul>
              {communities.slice(0,6).map((itemAtual) => {
                return(
                  <li key={itemAtual.id}>
                    <a href={`/communities/${itemAtual.id}`} >
                      <img src={itemAtual.imageUrl} />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          
        </div>
      </MainGrid>
    </>
  )
}

export async function getServerSideProps(ctx){
  const cookies = nookies.get(ctx)
  const token = cookies.USER_TOKEN

  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
  .then((response) => response.json()) 

  if(!isAuthenticated){
    return{
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const { githubUser } = jwt.decode(token)

  return{
    props: {
      githubUser
    },
  }
}
