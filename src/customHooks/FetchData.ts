import * as _React from 'react';
import { useState, useEffect, ReactNode } from 'react'; 


// internal imports
import { serverCalls } from '../api'; 



// WE are creating a custom hook to make API calls every time we go to the Shop page. 

// creaating our interfaces for our shop data & return of our hook

export interface ShopProps {
    prod_type: ReactNode;
    id: string,
    name: string,
    image: string,
    description: string,
    price: string, 
    prod_id: string,
    quantity: number, 
    order_id?: string
}

interface GetShopDataProps {
    shopData: ShopProps[]
    getData: () => void
}

interface GetOrderDataProps {
    orderData: ShopProps[]
    getData: () => void
}

// create our custom hook that get's called automatically when we go to our Shop page
export const useGetShop = (): GetShopDataProps => {
    // setup some hooks
    const [ shopData, setShopData ] = useState<ShopProps[]>([])


    const handleDataFetch = async () => {
        const result = await serverCalls.getShop() //making the api call from our serverCall dictionary/object

        setShopData(result)
    }

    // useEffect is essentially an event listener listening for changes to variables 
    // takes 2 arguments, 1 is the function to run, the 2nd is the variable we are watching in a []
    useEffect(()=> {
        handleDataFetch()
    }, []) //[] inside list is variable we are watching/listening to for changes 

    return { shopData, getData: handleDataFetch }

}

// create our custom hook that get's called automatically when we go to our Order page
export const useGetOrder = (): GetOrderDataProps => {
    // setup some hooks
    const [ orderData, setShopData ] = useState<ShopProps[]>([])


    const handleDataFetch = async () => {
        const result = await serverCalls.getOrder() //making the api call from our serverCall dictionary/object

        setShopData(result)
    }

    // useEffect is essentially an event listener listening for changes to variables 
    // takes 2 arguments, 1 is the function to run, the 2nd is the variable we are watching in a []
    useEffect(()=> {
        handleDataFetch()
    }, []) //[] inside list is variable we are watching/listening to for changes 

    return { orderData, getData: handleDataFetch }

}