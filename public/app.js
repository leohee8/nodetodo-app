const itemList=document.getElementById("item-list")

//>> Common template for todo item
function getItemTemplate(data){
	return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
		<span class="item-text">${data.item}</span>
        <div>
          <button data-id="${data._id}" class="edit-me btn btn-success btn-sm mr-1">Edit</button>
          <button data-id="${data._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
		</div>
	</li>`
}

//>> Generate the todo items list
function getItemList(data){
	if(data){
		let output=""
		data.forEach(item=>{output+=getItemTemplate(item)})
		itemList.innerHTML=output
	}
}

//>> Form submission
document.getElementById("form").addEventListener("submit",(e)=>{
	e.preventDefault()
	const itemNameInput=document.getElementById("itemName")
	if(itemNameInput.value){
		const _data={item:itemNameInput.value}
		axios.post("/create-item",_data)
		.then((response)=>{
			itemNameInput.value=""
			itemList.insertAdjacentHTML("beforeend",getItemTemplate(response.data))
		})
		.catch(err=>console.error(err))
	}else{
		itemNameInput.focus()
		alert("Item cannot be blank")
	}
})

//>> Edit and Delete clicked
itemList.addEventListener("click",(e)=>{
	if(e.target.classList.contains("edit-me")){
		const
			_currentItem=e.target.closest("li.list-group-item").querySelector(".item-text")
			_updatedItem=prompt("Edit the todo item",_currentItem.textContent),
			_data={
				id:e.target.dataset.id,
				item:_updatedItem
			}
		axios.post("/update-item",_data)
		.then(()=>{_currentItem.innerHTML=_updatedItem})
		.catch(err=>console.error(err))

	}else if(e.target.classList.contains("delete-me")){
		if(confirm("Are you sure to delete this item?")){
			axios.post("/delete-item",{id:e.target.dataset.id})
			.then(()=>{e.target.parentElement.parentElement.remove()})
			.catch(err=>console.error(err))
		}
	}
})

//>> On page load
document.addEventListener("DOMContentLoaded",()=>{
	getItemList(todoItems)
})