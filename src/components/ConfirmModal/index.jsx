import { ModalLayout, ModalBody, ModalHeader, ModalFooter } from '@strapi/design-system/ModalLayout'
import { Typography } from '@strapi/design-system/Typography'
import { Button } from '@strapi/design-system/Button'

export default function ConfirmModal ({ show, onCancel, confirmText, onConfirm, title, content, ContentComponent = null, hideCancel = false }) {
  if (!show) return null

  return (
    <ModalLayout onClose={onCancel} labelledBy='title'>
      <ModalHeader>
        <Typography fontWeight='bold' textColor='neutral800' as='h2' id='title'>
          {title || 'Confirm'}
        </Typography>
      </ModalHeader>
      <ModalBody>
        {
          ContentComponent || <Typography variant='omega'>{content || 'Do you confirm?'}</Typography>
        }
      </ModalBody>
      <ModalFooter
        endActions={(
          <>
            {!hideCancel &&
              <Button variant='secondary' onClick={onCancel}>Cancel</Button>}
            <Button onClick={onConfirm}>{confirmText || 'Confirm'}</Button>
          </>
        )}
      />
    </ModalLayout>
  )
}
