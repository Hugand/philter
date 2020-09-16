import React from 'react';
import '../../styles/views/edit-photo-screen.scss';
import EditPhotoSidebar from '../blocks/edit-photo-sidebar';
import EditPhotoPreview from '../blocks/edit-photo-preview';

function EditPhotoScreen() {
  return (
    <main className="edit-main">
        <EditPhotoPreview class="preview-container"></EditPhotoPreview>
        <EditPhotoSidebar class="sidebar-container"></EditPhotoSidebar>
    </main>
  );
}

export default EditPhotoScreen;
