import React from 'react'
import Button from 'react-bootstrap/Button';

const ValidateButton = ({showValidateHandler}) => {
    const handleValidateButton = () => {
        console.log('Showing')
        showValidateHandler(true)
    }

    return (
        <Button className='validatebutton' variant="success" onClick={handleValidateButton}>Validate</Button>
    );
}

export default ValidateButton