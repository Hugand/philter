import React from 'react';
import '../../styles/views/edit-photo-screen.scss';
import { Redirect } from 'react-router-dom'
import EditPhotoSidebar from '../blocks/edit-photo-sidebar';
import EditPhotoSidebarMobile from '../blocks/edit-photo-sidebar-mobile';
import EditPhotoPreview from '../blocks/edit-photo-preview';
import { useStateValue } from '../../state'

function EditPhotoScreen(props) {
  const [ { image, imageName }, dispatch ] = useStateValue()

  const goBack = () => {
    dispatch({
      type: 'resetData'
    })
    props.history.push('/')
  }

  return image === null || image === undefined  ? <Redirect to="/" />
    : (<main className="edit-main">
        <EditPhotoPreview
          class="preview-container"
          image={ image }
          imageName={ imageName }
          goBack={ goBack }></EditPhotoPreview>
        {/* <EditPhotoSidebar class="sidebar-container"></EditPhotoSidebar> */}
        <EditPhotoSidebarMobile class="bottom-container"></EditPhotoSidebarMobile>
    </main>)
}

export default EditPhotoScreen;
