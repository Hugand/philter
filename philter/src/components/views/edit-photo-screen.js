import React from 'react';
import '../../styles/views/edit-photo-screen.scss';
import EditPhotoSidebar from '../blocks/edit-photo-sidebar';
import EditPhotoPreview from '../blocks/edit-photo-preview';
import { useStateValue } from '../../state'

function EditPhotoScreen() {
  const [ { image }, dispatchImage ] = useStateValue()

  return (
    <main className="edit-main">
        <EditPhotoPreview class="preview-container" image={image}></EditPhotoPreview>
        <EditPhotoSidebar class="sidebar-container"></EditPhotoSidebar>
    </main>
  );
}

export default EditPhotoScreen;
