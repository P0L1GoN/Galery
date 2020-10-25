let openRequest=indexedDB.open("DataBase",1);
let db;
let imageAdd=document.getElementById('imageAdd')
let inputButt = document.getElementById('addImage')
let buttonClear=document.querySelector('.storageClear')
//let collectAdd=document.querySelector('.collectAdd')
let bgMask=document.getElementById('backgroundMask')
let inputForm=document.getElementById('newImageForm')
let inputDescription=document.getElementById('imageDescription')
buttonClear.onclick=function(){
    let transactions=db.transaction(['Images','Collections'],'readwrite')
    let imageDelete=transactions.objectStore('Images')
    let collectDelete=transactions.objectStore('Collections')
    imageDelete.clear()
    collectDelete.clear()
    location.reload()
}
imageAdd.onclick=function() {
    inputButt.click()
}
let inputName=document.getElementById('imageName')
let inputMime=document.getElementById('imageMime')
let inputSize=document.getElementById('imageSize')
let inputHW=document.getElementById('imageHW')
let imagePreview=document.getElementById('imagePreview')
newImage=function(){
    let fileReader = new FileReader()
    fileReader.onloadend = function (){
        inputForm.setAttribute('style','display:flex')
        imagePreview.setAttribute('src',fileReader.result)
        for(let i=0;i<inputButt.files[0].type.length;i++){
            if(inputButt.files[0].type[i]=='/')
                imageMime=inputButt.files[0].type.slice(i+1)
        }
        imageName=inputButt.files[0].name.slice(0,-4)
        let img=new Image()
        img.onload=function(){
            inputHW.setAttribute('value',img.naturalWidth.toString()+'x'+img.naturalHeight.toString())
        }
        img.src=fileReader.result
        inputName.setAttribute('value',imageName)
        console.log(imageName)
        inputMime.setAttribute('value',imageMime)
        inputSize.setAttribute('value',(inputButt.files[0].size/1024).toFixed(2)+'КБ')
        let buttonAdd=document.getElementById('imageAddButton')
        let addForm=document.getElementById('newImageForm')
        bgMask.setAttribute('style','display:block')
        addForm.setAttribute('style','display:flex')
        buttonAdd.innerHTML='Добавить'
        buttonAdd.setAttribute('onclick',`buttonAddClick()`)
    }
    if(inputButt.files[0])
        fileReader.readAsDataURL(inputButt.files[0])
}
buttonAddClick=(id=false)=>{//Функция кнопки добавления и изменения информации картинки
    if(!id){
        AddToDB({
            name: inputName.value,
            file:imagePreview.src,
            mime:inputMime.value,
            size:inputSize.value,
            hw:inputHW.value,
            description:inputDescription.value
        })
    }
    else{
        let transaction=db.transaction('Images','readwrite')
        let imageTransAdd=transaction.objectStore('Images')
        imageTransAdd.openCursor().onsuccess=event=>{
            let cursor=event.target.result
            if(cursor!=null){
                if(cursor.key==id){
                    imageTransAdd.put({
                        id:id,
                        name: inputName.value,
                        file:imagePreview.src,
                        mime:inputMime.value,
                        size:inputSize.value,
                        hw:inputHW.value,
                        description:inputDescription.value
                    })
                }
                else
                    cursor.continue();
            }
        }
        transaction.oncomplete=function(){
            location.reload()
        }
    }
    inputForm.setAttribute('style','')
    bgMask.setAttribute('style','')

}
let backButton=document.getElementById('imageBackButton')
backButton.onclick=function(){
    inputDescription.value=""
    inputForm.setAttribute('style','')
    bgMask.setAttribute('style','')
}
openRequest.onupgradeneeded=function(event) {
    console.log("Upgrading...")
    db=event.target.result
    //let collectStore=db.createObjectStore('Collections',{keyPath:"id",autoIncrement:true})
    let imageStore=db.createObjectStore('Images',{keyPath:"id",autoIncrement:true})
}
openRequest.onsuccess=event=>{
    console.log("Success")
    db=event.target.result
    let transactions=db.transaction(['Images','Collections'],'readwrite')
    let imageTrans=transactions.objectStore('Images')
    let imageRender=imageTrans.openCursor().onsuccess=event=> {
        let cursor=event.target.result
        if(cursor != null){
            addImage(cursor.value)
            cursor.continue()
        }
        else
            updateStorageInfo()
    }
    /*let collectRender=collectTrans.openCursor()
    collectRender.onsuccess=event=> {
        let cursor = event.target.result
        if (cursor != null) {
            addCollect(cursor.value,cursor.key)
            cursor.continue()
        }
    }*/
}
AddToDB=(image,collect=false)=>{
    if(image){
        let transaction=db.transaction('Images','readwrite')
        let imageTransAdd=transaction.objectStore('Images')
        imageTransAdd.add(image).onsuccess=event=>{
            console.log(event.target.result)
            imageTransAdd.openCursor().onsuccess=e=>{
                let cursor=e.target.result
                if(cursor.key == event.target.result)
                    addImage(cursor.value)
                else
                    cursor.continue()
            }
        }
    }
   /* else if(collect){
        let transaction=db.transaction('Collections','readwrite')
        collectTransAdd=transaction.objectStore('Collections')
        collectTransAdd.add(collect)
        addCollect(collect)
    }*/
}
/*addCollect=(collect,id)=>{
    let colCon=document.getElementById('collectionsContainer')
    let newCol=document.createElement("div")
    newCol.classList.add("collectBlock")
    newCol.id=id
    let colSlider=document.createElement("div")
    colSlider.classList.add('imageSlider')
    let colWrapper=document.createElement('div')
    colWrapper.classList.add('imageWrapper')
    let carButL=document.createElement('a')
    carButL.className='buttonCarousel leftButton'
    carButL.append('‹')
    let carButR=document.createElement('a')
    carButR.className='buttonCarousel rightButton'
    carButR.append('›')
    collect.imageList.forEach(image=>{
        let imgSrc=document.createElement("img")
        imgSrc.src=image
        colWrapper.appendChild(imgSrc)
    })
    let transform=0;
    let countImg= collect.imageList.length-1
    console.log(countImg)
    let controlButtons=function(){
        if(transform==0)
            carButL.setAttribute('style','display:none')
        else
            carButL.setAttribute('style','')
        if(countImg==0)
            carButR.setAttribute('style','display:none')
        else
            carButR.setAttribute('style','')
    }
    controlButtons()
    carButL.onclick=function(){
        transform=(transform+1) % countImg
        colWrapper.setAttribute('style','transform:translateX('+(transform*50).toString()+'%)')
        controlButtons()
    }
    carButR.onclick=function(){
        transform=(transform-1) % countImg
        colWrapper.setAttribute('style','transform:translateX('+(transform*50).toString()+'%)')
        controlButtons()
    }

    colSlider.appendChild(colWrapper)
    colSlider.appendChild(carButL)
    colSlider.appendChild(carButR)
    newCol.appendChild(colSlider)
    colCon.append(newCol)
    updateStorageInfo()
}*/
addImage=(image)=>{//функция добавления изображения на экран
    if(!image.name){
        console.error("Ошибка в инициализации картинки")
        return
    }
    let imCon=document.getElementById('imagesContainer')
    let newImg=document.createElement("div")
    newImg.classList.add("imageBlock")
    newImg.id=image.id
    let imgSrc=document.createElement("img")
    if(image.file)
        imgSrc.src=image.file
    let panelName=document.createElement('div')
    panelName.className='panel imageName'
    if(image.name.length>7)
        panelName.append(image.name.slice(0,6)+'...')
    else
        panelName.append(image.name)
    let imageInfo=document.createElement('div')
    imageInfo.classList.add('imageInfo')
    imageInfo.onclick=function(){
        bgMask.setAttribute('style','display:block')
        let infoForm=document.getElementById('imageInfoBlock')
        infoForm.setAttribute('style','display:flex')
        infoForm.innerHTML=`
            <div id="imageBlock">
                <div id="imageNameInfo">${image.name}</div>
                <img id="imagePresentation" src="${image.file}">
            </div>
            
            <div id="infoBlock">
                <span>${image.description}</span>
                <span>Размер:</span> ${image.hw}
                <span>Вес:</span> ${image.size}
                <span>MIME-тип:</span> ${image.mime}
            </div>
            <div id="closeInfoForm"></div>
        `
        let buttonClose=document.getElementById('closeInfoForm')
        buttonClose.onclick=function(){
            infoForm.setAttribute('style','')
            bgMask.setAttribute('style','')
        }
    }
    imgSrc.onclick=function(){
        imageInfo.click()
    }
    panelName.appendChild(imageInfo)
    let panelEdit=document.createElement('div')
    panelEdit.classList.add('panelEdit')
    panelEdit.onclick=function(){
        let buttonAdd=document.getElementById('imageAddButton')
        inputForm.setAttribute('style','display:flex')
        bgMask.setAttribute('style','display:block')
        inputName.setAttribute('value',image.name)
        inputMime.setAttribute('value',image.mime)
        inputHW.setAttribute('value',image.hw)
        inputSize.setAttribute('value',image.size)
        imagePreview.src=image.file
        inputDescription.value=image.description
        buttonAdd.innerHTML='Изменить'
        buttonAdd.setAttribute('onclick',`buttonAddClick(${image.id})`)
    }
    let panelDownload=document.createElement('a')
    panelDownload.classList.add('panelDownload')
    panelDownload.onclick=function(){
        let downloadA=document.createElement('a')
        downloadA.setAttribute('href',image.file)
        downloadA.setAttribute('download',image.name)
        downloadA.click()
    }
    panelDownload.setAttribute('download',imageName)
    let panelDelete=document.createElement('div')
    panelDelete.classList.add('panelDelete')
    panelDelete.onclick=function(){
        let transaction=db.transaction('Images','readwrite')
        let imageTransaction=transaction.objectStore('Images')
        imageTransaction.delete(image.id)
        newImg.setAttribute('style','display:none')
    }
    let panelSettings=document.createElement('div')
    panelSettings.className='panel imageSettings'
    panelSettings.appendChild(panelEdit)
    panelSettings.appendChild(panelDownload)
    panelSettings.appendChild(panelDelete)
    newImg.appendChild(imgSrc)
    newImg.appendChild(panelName)
    newImg.appendChild(panelSettings)
    newImg.onmouseover=function(){
        panelName.setAttribute('style','visibility:visible')
        panelSettings.setAttribute('style','visibility:visible')
    }
    newImg.onmouseout=function () {
        panelName.setAttribute('style','visibility:hidden')
        panelSettings.setAttribute('style','visibility:hidden')
    }
    imCon.appendChild(newImg)
    updateStorageInfo()
}
updateStorageInfo=function(){//Функция обновления значения заполненности хранилища
    let storageInfo=document.querySelector('.storageInfo')
    navigator.storage.estimate().then(function(estimate){
        let storagePercent=estimate.usage/estimate.quota
        storageInfo.innerHTML=storagePercent.toFixed(2)+'%'
        if(storagePercent>50)
            storageInfo.setAttribute('style','background-color:yellow')
        else if(storagePercent>80)
            storageInfo.setAttribute('style','background-color:red')
    })
}
let searchInput=document.getElementById('inputSearch')
searchInput.oninput=function(){
    let transaction=db.transaction('Images','readonly')
    let imageBlocks=document.querySelectorAll('.imageBlock')
    let imageTrans=transaction.objectStore('Images')
    imageTrans.openCursor().onsuccess=event=>{
        let cursor=event.target.result
        if(cursor!=null){
            if(!cursor.value.name.toLowerCase().includes(searchInput.value.toLowerCase())){//Если название картинки НЕ имеет в себе значение инпута
                imageBlocks.forEach(el=>{
                    if(cursor.key==el.id)
                        el.setAttribute('style','display:none')
                })
                cursor.continue()
            }
            else{
                imageBlocks.forEach(el=>{
                    if(cursor.key==el.id)
                        el.setAttribute('style','')
                })
                cursor.continue();
            }
        }
    }
}
openRequest.onerror=function(){
    console.log("Here is ERROR");
};