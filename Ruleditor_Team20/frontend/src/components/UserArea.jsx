import React, { useEffect, useState } from 'react'
import CodeSelector from './CodeSelector'
import Editor from './Editor'
import UploadButton from './UploadButton'
import ValidateButton from './ValidateButton'
import { Button , Modal, Alert} from 'react-bootstrap'

const UserArea = () => {
  const [editor,setEditor] = useState()
  const [message,setMessage] = useState("")
  const [variant,setVariant] = useState("")
  const [show,setShow] = useState(false)
  const [uploadData,setUploadData] = useState([])
  const [base64code_arr,setBase64code_arr] = useState([])

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  console.log(queryString)
  const pname = urlParams.get('p_name');
  const projId = urlParams.get('proj_id');
  console.log(pname, projId);
  var returnObj = {p_name: pname, proj_id: projId, base64Array: []};

  const childToParentInit = (editor_ref) => {
    setEditor(editor_ref)
    // editor = editor_ref
    // console.log("EDITOR from Parent: ");
    // console.log(editor)
    // editor.session.insert(editor.getCursorPosition() , "EDITOR from Parent: ");
  }

  const constructClickHandler = (code) => {
    editor.session.insert(editor.getCursorPosition() , code);
  }

  const showValidateHandler = (isvalid) => {
    console.log(editor.session.getValue())
    let code = editor.session.getValue()
    let base64code = "";
    fetch(`http://localhost:5001/api/process`,{
        method: 'POST',
        body: code
    }).then((response) => {
      response.json().then(val => {
        console.log("Validation response from server")
        console.log(val)
        if(val.valid){
          base64code = btoa(code)
          console.log(base64code)
          console.log(window.location.href)
          setMessage("Validation successful! ")
          setVariant("success")
          setBase64code_arr(base64code_arr.concat(base64code))
          console.log(base64code_arr);
        }
        else{
          setMessage("Error at line number: " + val.lineNumber)
          setVariant("danger")
        }
        setShow(true);
      })
    })
    // if(isvalid){
    //   setMessage("Validation successful!")
    // }
    // else{
    //   setMessage("Validation failed")
    // }
    // setShow(true);
  }

  const handleClose = () => {
    setShow(false)
  }

  //mongodb
  const handleSave = () => {
    console.log("ghsavdsjhdvajshd",base64code_arr)
    returnObj.base64Array = base64code_arr;
    const returnobj_json = JSON.stringify(returnObj)
    fetch("http://localhost:5001/api/save",{
      method: "POST",
      body: returnobj_json 
    }).then(res => {
      console.log("Response from server after sending encoded string")
      console.log(res)
      console.log(res.status)
      if(res.status === 200)
      {
        // alert("sds")
        setMessage("Saved successfully")
        setVariant("success")
      }
      else{
        setMessage("Could not save")
        setVariant("danger")
      }
      setShow(true)
      // res.json().then(val => {
      //     console.log("val",val.status)
      //     if(val.status !== "Internal Server Error"){
      //         setMessage("Saved successfully")
      //         setVariant("success")
      //     }
      //     else{
      //       setMessage("Could not save")
      //       setVariant("danger")
      //     }
      //     // if(val.s)
      // })
    })
    // console.log(JSON.stringify(returnObj));
    // console.log(returnobj_json);
  }

  const handleNext = () => {
    console.log("sending", returnObj);
  }

  const uploadToUserArea = (upload_response) => {
    console.log("parent")
    console.log(upload_response);
    setUploadData(upload_response);
  }

  return (
    <div>
    <UploadButton uploadToUserArea={uploadToUserArea}/>
    <div className='userarea'>
        <CodeSelector constructClickHandler={constructClickHandler} uploadData={uploadData}/>
        <Editor childToParentInit={childToParentInit}/>
        
        <div className='buttonsDisp'>
          <Button className='validatebutton' variant="success" onClick={handleSave}>Save</Button>
          <Button className='validatebutton' variant="success" onClick={handleNext}>Next</Button>
          <ValidateButton showValidateHandler={showValidateHandler}/>
        </div>
        
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* {message} */}
            <Alert key={variant} variant={variant}>
              {message}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
    </div>
    </div>
  )
}

export default UserArea