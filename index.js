let openRequest=indexedDB.open("DataBase",1);
let db;
let imageTrans;
let collectTrans;
let imageAdd=document.getElementById('imageAdd')
let inputButt = document.getElementById('addImage')
let buttonClear=document.querySelector('.storageClear')
let collectAdd=document.querySelector('.collectAdd')
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
collectAdd.onclick=function (){

}
newImage=function(){
    let fileReader = new FileReader()
    fileReader.onloadend = function (){
        let inputForm=document.getElementById('newImageForm')
        inputForm.setAttribute('style','display:flex')
        let inputName=document.getElementById('imageName')
        let inputMime=document.getElementById('imageMime')
        let inputSize=document.getElementById('imageSize')
        let inputHW=document.getElementById('imageHW')
        let inputDescription=document.getElementById('imageDescription')
        let imagePreview=document.getElementById('imagePreview')
        imagePreview.setAttribute('src',fileReader.result)
        let imageName
        let imageMime
        if(inputButt.files[0].name.includes('.') ){
            for(let i=0;i<inputButt.files[0].name.length;i++){
                if(inputButt.files[0].name[i]=='.') {
                    imageMime=inputButt.files[0].name.slice(i)
                    imageName=inputButt.files[0].name.slice(0,i)
                    break
                }
            }
        }
        let img=new Image()
        img.onload=function(){
            inputHW.setAttribute('value',img.naturalWidth.toString()+'x'+img.naturalHeight.toString())
        }
        img.src=fileReader.result
        inputName.setAttribute('value',imageName)
        inputMime.setAttribute('value',imageMime)
        inputSize.setAttribute('value',(inputButt.files[0].size/1000).toString()+'КБ')
        let buttonAdd=document.getElementById('imageAddButton')
        buttonAdd.onclick=function(){
            AddToDB({
                name: inputName.value,
                file:fileReader.result,
                mime:inputMime.value,
                size:inputSize.value,
                hw:inputHW.value,
                description:inputDescription.value
            })
            inputDescription.value=""
            inputForm.setAttribute('style','')
        }
    }
    if(inputButt.files[0])
        fileReader.readAsDataURL(inputButt.files[0])
}

openRequest.onupgradeneeded=function(event) {
    console.log("Upgrading...");
    db=event.target.result
    let collectStore=db.createObjectStore('Collections',{autoIncrement:'true'});
    let imageStore=db.createObjectStore('Images',{autoIncrement:'true'});
};
openRequest.onsuccess=event=>{
    console.log("Success")
    db=event.target.result
    let transactions=db.transaction(['Images','Collections'],'readwrite')
    imageTrans=transactions.objectStore('Images')
    collectTrans=transactions.objectStore('Collections')
    let imageRender=imageTrans.openCursor()
    let imageCount=0;
    imageRender.onsuccess=event=> {
        let cursor=event.target.result
        if(cursor != null){
            addImage(cursor.value,cursor.key)
            cursor.continue()
            imageCount++
        }
    }
    let collectRender=collectTrans.openCursor()
    collectRender.onsuccess=event=> {
        let cursor = event.target.result
        if (cursor != null) {
            addCollect(cursor.value,cursor.key)
            cursor.continue()
        }
    }
    addCollect({
        imageList:[
            'https://yummyanime.club/img/posters/1567878394.jpg',
            'https://steamcdn-a.akamaihd.net/steam/apps/1298590/capsule_616x353.jpg?t=1589198152',
            'https://yummyanime.club/img/posters/1567878394.jpg'
        ]
    },0)
    let storageInfo=document.querySelector('.storageInfo')
    storageInfo.append(imageCount.toString())
}
AddToDB=(image,collect)=>{
    if(image){
        let transaction=db.transaction('Images','readwrite')
        imageTransAdd=transaction.objectStore('Images')
        imageTransAdd.add(image)
        let imgId=imageTransAdd.count()
        imgId.onsuccess=event=>{
            addImage(image,event.target.result)
        }

    }
    else if(collect){
        let transaction=db.transaction('Collections','readwrite')
        collectTransAdd=transaction.objectStore('Collections')
        collectTransAdd.add(collect)
        addCollect(collect)
    }
}
addCollect=(collect,id)=>{
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
}
addImage=(image,id)=>{
    if(!image.name){
        console.error("Ошибка в инициализации картинки")
        return
    }
    let imCon=document.getElementById('imagesContainer')
    let newImg=document.createElement("div")
    newImg.classList.add("imageBlock")
    newImg.id=id
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

    }
    panelName.appendChild(imageInfo)
    let panelEdit=document.createElement('div')
    panelEdit.classList.add('panelEdit')
    let panelDownload=document.createElement('a')
    panelDownload.classList.add('panelDownload')
    panelDownload.href=image.file
    panelDownload.setAttribute('download',imageName)
    let panelDelete=document.createElement('div')
    panelDelete.classList.add('panelDelete')
    panelDelete.onclick=function(){
        let transaction=db.transaction('Images','readwrite')
        imageTransaction=transaction.objectStore('Images')
        console.log(id)
        imageTransaction.delete(id)
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
}
openRequest.onerror=function(){
    console.log("Here is ERROR");
};