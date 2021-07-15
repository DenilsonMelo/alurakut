import { SiteClient } from 'datocms-client'

export default async function receiveRequest(request, response){

    if(request.method === 'POST'){
        const TOKEN = 'f354fd145d0570ace6b752246e5bec'
        const client = new SiteClient(TOKEN)

        const createRegister = await client.items.create({
            itemType: "966371",
            ...request.body,
            // title: "Comunidade Teste",
            // imageUrl: "https://github.com/denilsonmelo.png",
            // creatorSlug: "denilsonmelo",
        })

        response.json({
            dados: '',
            createRegister: createRegister,
        })

        return
    }
    
    response.status(404).json({
        message: 'Ainda não temos nada no GET, mas no POST tem!'
    })
       
    }
    
    