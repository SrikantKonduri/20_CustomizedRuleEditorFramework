import Button from 'react-bootstrap/Button';
import React, { Component } from 'react'

//reference video
//https://www.youtube.com/watch?v=sp9r6hSWH_o

export default class UploadButton extends Component {

    async onChange(e){
        let files = e.target.files;
        let reader = new FileReader();
        // reader.readAsDataURL(files[0]);
        reader.readAsText(files[0]);
        reader.onload = (e) => {
            // console.warn("json data ", e.target.result);
            const url = "server/upload";
            // const jsonData = {file: e.target.result};
            const jsonData = e.target.result;
            // console.error(jsonData);
            let arr;
            // const response = await fetch(`http://localhost:5001/api/upload`,{
            fetch(`http://localhost:5001/api/upload`,{
                method: 'POST',
                body: jsonData
            }).then((response) => {
                // let temp  = await response.json()
                response.json().then(val => {
                    // console.log("magishu")
                    // console.log(val);
                    arr = val.statements;
                    // console.log(arr);
                    this.props.uploadToUserArea(arr)
                    // arr += val;
                    // arr.concat(val);
                })
                // console.log(`Response: ${response.json()}`)
            })
            // console.log("Magishu")
            // return post(url, jsonData).then(response=>console.warn("result", response))
        }
    }

    render() {
        return (
            <div className='uploaddiv'>
                Upload Syntax File
                <Button className='uploadbutton' variant="secondary">
                    <input type="file" name="file" onChange={(e)=>this.onChange(e)} />
                </Button>
            </div>
        )
    }
}
