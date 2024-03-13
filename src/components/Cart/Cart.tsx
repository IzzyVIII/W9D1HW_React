import * as _React from 'react'; 
import { useState, useEffect } from 'react'; 
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Box,
    Button,
    Stack,
    Typography,
    Snackbar,
    Alert } 
from '@mui/material'; 
import InfoIcon from '@mui/icons-material/Info';
import { getDatabase, ref, onValue, off, remove, update } from 'firebase/database';

// internal imports
import { NavBar } from '../sharedComponents';
import { theme } from '../../Theme/themes';
import { ShopProps } from '../../customHooks';
import { shopStyles } from '../Shop';
import { serverCalls } from '../../api';
import { MessageType } from '../Auth';
import { Order } from '../Order'

export interface CreateOrderProps {
    order: ShopProps[]
}

export const Cart = () => {
    //   setup our hooks
    const db = getDatabase();
    const [ open, setOpen ] = useState(false)
    const [ message, setMessage] = useState<string>()
    const [ messageType, setMessageType ] = useState<MessageType>()
    const [ currentCart, setCurrentCart ] = useState<ShopProps[]>()
    const userId = localStorage.getItem('uuid')
    const cartRef = ref(db, `carts/${userId}/`); 

    // useEffect to monitor changes to our cart in our database
    // takes in 2 arguments, 1st is function to run, 2nd is variable we are monitoring 
    useEffect(()=> {


        // onValue() is listening for changes in cart
        onValue(cartRef, (snapshot) => {
            const data = snapshot.val() //grabbing our cart data from the database

            // whats coming back from the database is essentially a dictionary/object
            // we want our ddata to be a list of objects so we can forloop/map over them
            let cartList = []

            if (data){
                for (let [key, value] of Object.entries(data)){
                    let cartItem = value as ShopProps
                    cartItem['id'] = key
                    cartList.push(cartItem)
                }}

            setCurrentCart(cartList as ShopProps[])
        })

        // using the off to detach the listener (aka its basically refreshing the listener)
        return () => {
            off(cartRef)
        }
    },[]);

    // Full CRUD capabilities for our Cart 
    // Update Cart
    const updateQuantity = async (id: string, operation: '-' | '+') => {

        // findIndex method to find the index of a value based on a conditional
        const dataIndex: number = currentCart?.findIndex((cart) => cart.id === id) as number


           // make a new variable for our currentCart
           const updateCart = [...currentCart as ShopProps[]]
           operation === '-' ? updateCart[dataIndex].quantity -= 1 : updateCart[dataIndex].quantity += 1
           
           setCurrentCart(updateCart)
       }

    // function to Update Cart items
    const updateCart = async ( cartItem: ShopProps ) => {

        const itemRef = ref(db, `carts/${userId}/${cartItem.id}`)

        // use the update() from our database to update a specific cart item
        update(itemRef, {
            quantity: cartItem.quantity
        })
        .then(() => {
            setMessage('Successfully Updated Your Cart')
            setMessageType('success')
            setOpen(true)
        })
        .then(()=> { setTimeout( () => window.location.reload(), 2000)})
        .catch((error)=> {
            setMessage(error.message)
            setMessageType('error')
            setOpen(true)
        })
    }


    // function to Delete Items from our cart
    const deleteItem = async (cartItem: ShopProps ) => {
        const itemRef = ref(db, `carts/${userId}/${cartItem.id}`)

        // use the update() from our database to update a specific cart item
        remove(itemRef)
        .then(() => {
            setMessage('Successfully Removed Item from Cart')
            setMessageType('success')
            setOpen(true)
        })
        .then(()=> { setTimeout( () => window.location.reload(), 2000)})
        .catch((error)=> {
            setMessage(error.message)
            setMessageType('error')
            setOpen(true)
        })
    }

    const checkout = async () => {

        const data: CreateOrderProps = {
        'order': currentCart as ShopProps[]
       }

       //console.log('we in the checkout zone!')

        const response = await serverCalls.createOrder(data)

        if (response.status === 200) { //200 is a good status code
            remove(cartRef) //this is removing our whole entire cartRef aka emptying our cart
                .then(() => {
                    setMessage('Successfully Checked Out')
                    setMessageType('success')
                    setOpen(true)
                })
                .then( () => setTimeout(()=> window.location.reload(),2000))
                .catch((error) => {
                    setMessage(error.message)
                    setMessageType('error')
                    setOpen(true)
                })
        } else {
            setMessage('Error with your Checkout')
            setMessageType('error')
            setOpen(true)
        }
    }

    return (
        <Box sx={shopStyles.main}>
            <NavBar />
            <Stack direction = 'column' sx={shopStyles.main} alignItems='center'>
                <Stack direction='row' alignItems='center' justifyContent='start' sx={{ marginTop: '100px', width: '100%', marginLeft: '400px'}}>
                    <Typography variant = 'h4'sx = {{ marginRight: '20px'}}>
                        Your Cart
                    </Typography>
                    <Button color='primary' variant='contained' onClick={ checkout } sx={{ width: '150px' }} >Checkout</Button>
                </Stack>
                <Grid container spacing={3} sx={shopStyles.grid}>
                    {currentCart?.map((cart: ShopProps, index: number) => (
                        <Grid item key={index} xs={12} md={6} lg={4}>
                            <Card sx={shopStyles.card}>
                                <CardMedia 
                                    component = 'img'
                                    sx = {shopStyles.cardMedia}
                                    image = {cart.image}
                                    alt = {cart.name}
                                />
                                <CardContent>
                                    <Stack direction = 'column' justifyContent='space-between' alignItems = 'center'>
                                        <Accordion sx = {{color: 'white', backgroundColor: theme.palette.secondary.light}}>
                                            <AccordionSummary expandIcon={<InfoIcon sx={{color: theme.palette.primary.main}}/>}>
                                                <Typography>{cart.name}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography>{cart.description}</Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                        <Stack 
                                            direction = 'row' 
                                            alignItems = 'center' 
                                            justifyContent='space-between' 
                                            sx={shopStyles.stack2}
                                        >
                                            <Button 
                                                size='large'
                                                variant='text'
                                                onClick={ () => updateQuantity( cart.id, '-') }
                                            >
                                                -
                                            </Button>
                                            <Typography variant = 'h6' sx={{color: 'white'}}>
                                                {cart.quantity}
                                            </Typography>
                                            <Button 
                                                size='large'
                                                variant='text'
                                                onClick={ () => updateQuantity( cart.id, '+') }
                                            >+</Button>
                                        </Stack>
                                        <Button 
                                            size = 'medium'
                                            variant = 'outlined'
                                            sx = {shopStyles.button}
                                            onClick={ ()=> updateCart(cart)}
                                        >
                                            Update Quantity - ${(cart.quantity * parseFloat(cart.price)).toFixed(2)}
                                        </Button>
                                        <Button 
                                            size = 'medium'
                                            variant = 'outlined'
                                            sx = {shopStyles.button}
                                            onClick={ ()=> deleteItem(cart)}
                                        >
                                            Delete Item From Cart
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Stack direction='column' sx={{ width: '75%', marginTop: '100px'}}>
                    <Typography variant ='h4' sx={{marginRight: '20px'}}>
                        Your Orders
                    </Typography>
                    <Order />
                </Stack>
            </Stack>
            <Snackbar open={open} autoHideDuration={2000} onClose={()=> setOpen(false)}>
                <Alert severity={messageType}>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    )
}