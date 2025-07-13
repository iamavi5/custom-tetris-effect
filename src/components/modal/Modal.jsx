import React, { useCallback } from 'react'
import './modal.css';

const Modal = ({headingText, descriptionText, primaryAction , primaryButtonText,  secondaryAction, secondaryButtonText}) => {

 const handlePrimaryAction = useCallback((event) => {
    event.preventDefault();
    primaryAction();
 },[primaryAction])
 
 const handleSecondaryAction = useCallback((event) => {
    event.preventDefault();
    secondaryAction();
 }, [secondaryAction])
 

  return (
    <div className='modal-overlay'>
    <div className='modal-content'>
        {headingText && <div className='heading-section'>
            <h2>{headingText}</h2>
        </div>}
        <div className='body-content'>
            {descriptionText &&  <p className='description-text'>{descriptionText}</p>
}
            {(primaryAction || secondaryAction) && <div className='button-container'>
                {primaryAction && <button className='primary-button' onClick={handlePrimaryAction} >{primaryButtonText}</button>}
                {secondaryAction && <button className='secondary-button' onClick={handleSecondaryAction} >{secondaryButtonText}</button>}
            </div>}
        </div>
      
    </div>
    </div>
  )
}

export default Modal
