import * as _React from 'react';
import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Snackbar,
    Alert
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';

// internal imports
import { serverCalls } from '../../api';
import { InputText } from '../sharedComponents';
import { theme } from '../../Theme/themes';
import { ShopProps, useGetOrder } from '../../customHooks';
import { SubmitProps } from '../Shop';
import { MessageType } from '../Auth';



const columns: GridColDef[] = [
  {
    field: 'image', //grabing the key from our dictionaries
    headerName: 'Image',
    width: 150,
    renderCell: (param) => (
        <img
        src={param.row.image} alt={param.row.name} style={{maxHeight: '100%', aspectRatio: '1/1'}}
        ></img>
    )
  },
  {
    field: 'name',
    headerName: 'Last Name',
    width: 200,
    editable: true,
  },
  {
    field: 'prod_type',
    headerName: 'Prod_type',
    width: 100,
    editable: true,
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'number',
    width: 100,
    editable: true,
  },
  {
    field: 'quantity',
    headerName: 'Quantity',
    width: 100,
    editable: true,
  },
  {
    field: 'color',
    headerName: 'Color',
    width: 150,
    editable: true,
  },
  {
    field: 'prod_id',
    headerName: 'Product ID',
    width: 300,
    editable: true,
    hideable: true
  },
  {
    field: 'id',
    headerName: 'Order ID',
    width: 100,
    editable: true,
    hideable: true
  },

];

interface UpdateProps {
    id: string,
    orderData: ShopProps[]
}

const UpdateQuantity = (props: UpdateProps) => {
    // setup Hooks
    const [ openAlert, setOpen ] = useState(false)
    const [ message, setMessage ] = useState<string>()
    const [ messageType, setMessageType ] = useState<MessageType>()
    const { register, handleSubmit } = useForm<SubmitProps>({})

    useEffect(() => {
        if (props.id === 'undefined') {
            setMessage('No order Selected')
            setMessageType('error')
            setOpen(true)
        }
    }, [])

    const onSubmit: SubmitHandler<SubmitProps> = async (data, event) => {
        if (event) event.preventDefault();

        let orderId: string = ""
        let prodId: string = ""


        for (let order of props.orderData){
            if (order.id === props.id){
                orderId = order.order_id as string
                prodId = order.prod_id as string
            }
        }

        // data object to pass to flask
        const updateData = {
            'prod_id': prodId,
            'quantity': parseInt(data.quantity)
        }
        // api call 
        const response = await serverCalls.updateOrder(orderId, updateData)
        if (response.status === 200){
            setMessage('Successfully updated item in your Order')
            setMessageType('success')
            setOpen(true)
            setTimeout(()=>{window.location.reload()}, 2000)
        } else {
            setMessage(response.message)
            setMessageType('error')
            setOpen(true)
        }
    }

    return(
        <Box sx={{padding: '20px'}}>
            <form onSubmit = {handleSubmit(onSubmit)}>
                <Box>
                    <label htmlFor="quantity">What is the updated quantity?</label>
                    <InputText {...register('quantity')} name='quantity' placeholder='Quantity Here' />
                </Box>
                <Button type='submit'>Submit</Button>
            </form>
            <Snackbar
                open={openAlert}
                autoHideDuration={2000}
                onClose={()=> setOpen(false)}>
                <Alert severity = {messageType}>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    )
}


export const Order = () => {
    // set up our hooks
    const { orderData } = useGetOrder();
    const [ gridData, setGridData ] = useState<GridRowSelectionModel>([])
    const [ open, setOpen ] = useState(false)
    const [message, setMessage ] = useState<string>()
    const [messageType, setMessageType] = useState<MessageType>()
    const [openDialog, setOpenDialog] = useState(false)

    //function to delete orders

    const deleteItem = async () => {
        const id = `${gridData[0]}`

        let orderId: string = ""
        let prodId: string = ""

        // make sure the user selected something
        if (id === 'undefined'){
            setMessage('No Order Selected')
            setMessageType('error')
            setOpen(true)
        }

        //loop through our orderData until we find the right object/dictionary
        for (let order of orderData) {
            if (order.id === id) {
                orderId = order.order_id as string
                prodId = order.prod_id as string
            }
        }

        const deleteData = {
            'prod_id': prodId
        } 

        const response = await serverCalls.deleteOrder(orderId, deleteData)

        if (response.status === 200){
            setMessage('Successfully deleted order')
            setMessageType('success')
            setOpen(true)
            setTimeout(()=> window.location.reload(), 2000)
        }   else {
            setMessage(response.message)
            setMessageType('error')
            setOpen(true)
        }
    }

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={orderData}
                columns={columns}
                sx={{backgroundColor: theme.palette.secondary.light, borderColor: theme.palette.primary.main, color: 'white'}}
                initialState={{
                    pagination: {
                    paginationModel: {
                    pageSize: 5,
                },
            },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        getRowId={(row)=> row.id}
        onRowSelectionModelChange = { (newSelectionModel) => { setGridData(newSelectionModel) }}
      />
        <Button variant='outlined' color='info' sx={{ marginRight: '10px'}} onClick={()=>{ setOpenDialog(true)}}>Update</Button>
        <Button variant='outlined' color='error' onClick={ deleteItem }>Delete</Button>
        <Dialog open={openDialog} onClose={()=> setOpenDialog(false)}>
            <DialogContent>
                <UpdateQuantity id = {`${gridData[0]}`} orderData = {orderData} />
            </DialogContent>
            <DialogActions>
                <Button onClick={ ()=> setOpenDialog(false) }>Cancel</Button>
            </DialogActions>
        </Dialog>
        <Snackbar 
            open={open} 
            autoHideDuration={2000} 
            onClose = { ()=> setOpen(false)}
        >
            <Alert severity={messageType}>
                {message}
            </Alert>
        </Snackbar>
    </Box>
  );
}