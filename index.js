let openRequest=indexedDB.open("DataBase",1);
let db;
let imageTrans;
let collectTrans;
let imageAdd=document.getElementById('imageAdd')
let inputButt = document.getElementById('addImage')

imageAdd.onclick=function() {
    inputButt.click()
}
newImage=function(){
    let fileReader = new FileReader()
    fileReader.onloadend = function (){
        AddToDB({
            name: inputButt.files[0].name,
            file:fileReader.result
        })
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
openRequest.onsuccess=function (event){
    console.log("Success")
    db=event.target.result
    let transactions=db.transaction(['Images','Collections'],'readwrite')
    imageTrans=transactions.objectStore('Images')
    collectTrans=transactions.objectStore('Collections')
    let imageRender=imageTrans.openCursor()
    imageRender.onsuccess=event=> {
        let cursor=event.target.result
        if(cursor != null){
            addImage(cursor.value)
            cursor.continue()
        }
    }
    let collectRender=collectTrans.openCursor()
    collectRender.onsuccess=event=> {
        let cursor = event.target.result
        if (cursor != null) {
            addCollect(cursor.value)
            cursor.continue()
        }
    }
}
AddToDB=(image,collect)=>{
    if(image){
        let transaction=db.transaction('Images','readwrite')
        imageTranss=transaction.objectStore('Images')
        imageTranss.add(image)
        addImage(image)
    }
    else if(collect){

    }
}
addCollect=collect=>{
    let colCon=document.getElementById('collectionsContainer')
    let newCol=document.createElement("div")
    newCol.classList.add("collectBlock")
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
        imgSrc.src="media/images/"+image
        colWrapper.appendChild(imgSrc)
    })
    colWrapper.appendChild(carButL)
    colWrapper.appendChild(carButR)
    colSlider.appendChild(colWrapper)
    newCol.appendChild(colSlider)
    colCon.append(newCol)
}
addImage=image=>{
    if(!image.name){
        console.error("Ошибка в инициализации картинки")
        return
    }
    let imCon=document.getElementById('imagesContainer')
    let newImg=document.createElement("div")
    newImg.classList.add("imageBlock")
    let imgSrc=document.createElement("img")
    if(image.file)
        imgSrc.src=image.file
    else
        imgSrc.src="media/images/"+image.name
    let panelName=document.createElement('div')
    panelName.className='panel imageName'
    panelName.append(image.name)
    let panelSettings=document.createElement('div')
    panelSettings.className='panel imageSettings'
    panelSettings.append(image.name)
    newImg.appendChild(imgSrc)
    newImg.appendChild(panelName)
    newImg.appendChild(panelSettings)
    newImg.onmouseover=function(){
        panelName.setAttribute('style','display:block')
        panelSettings.setAttribute('style','display:block')
    }
    newImg.onmouseout=function () {
        panelName.setAttribute('style','')
        panelSettings.setAttribute('style','')
    }
    imCon.appendChild(newImg)
}
openRequest.onerror=function(){
    console.log("Here is ERROR");
};