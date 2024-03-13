import { ShopProps } from "../customHooks";
import { CreateOrderProps } from "../components";

let accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcxMDI2ODgyMiwianRpIjoiNjFiOTBkOTEtNGI3Ni00ZjE5LWI0NmQtZGVjM2FmOWU5Mjc2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IlNjb290ZXIgU3F1YWQiLCJuYmYiOjE3MTAyNjg4MjIsImNzcmYiOiIzZmM1ZmM3Ni1lNTFlLTRhOTItOWNhOS1iYmE4NjQ4MTNjOGUiLCJleHAiOjE3NDE4MDQ4MjJ9.fgCPho2yDOb6NGe0m28VNL8di3SPDnlshd2T6xF35Bk"
let userId = localStorage.getItem('uuid') //grabbing the uuid from Google Authentication 

type PartialShopProps = Partial<ShopProps>

    // putting all our API calls in a giant dictionary/object

export const serverCalls = {

    getShop: async () => {
        // api call consist of 1-5 things 
        // 1. url (required)
        // 2. method (optional it will default to GET)
        // 3. headers (optional but usually there) authentication type & type of data 
        // 4. body (optional usually only on a POST, PUT and sometimes DELETE)
        // 5. parameters (optional)
        const response = await fetch(`https://scootershop.onrender.com/api/shop`, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data'), response.status 
        }

        return await response.json()

    },

    getOrder: async () => {
        const response = await fetch(`https://scootershop.onrender.com/api/order/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${accessToken}`
                }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch data'), response.status
        }
        
        return await response.json()
    },
    createOrder: async (data: CreateOrderProps) => { //gotta come back and get rid of that pesky any type
        const response = await fetch(`https://scootershop.onrender.com/api/order/create/${userId}`,{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${accessToken}`
                },
            body: JSON.stringify(data) //jsonifying our data so it is readable on the other side 
        })
        
        if (!response.ok) {
            throw new Error('Failed to create data'), response.status
        }
        
        return await response.json()
        
    },
    updateOrder: async (orderId: string, data: PartialShopProps) => {
        const response = await fetch(`https://scootershop.onrender.com/api/order/update/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${accessToken}`
                },
            body: JSON.stringify(data)
        })
        
        if (!response.ok) {
            throw new Error('Failed to update data'), response.status
        }
        
        return await response.json()
    },
    deleteOrder: async(orderId: string, data: PartialShopProps) => {
        const response = await fetch(`https://scootershop.onrender.com/api/order/delete/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${accessToken}`
                },
            body: JSON.stringify(data)
        })
        
        if (!response.ok) {
            throw new Error('Failed to delete data'), response.status
        }
        
        return await response.json()
    }

}