const
	appName="2do List",
	exp=require("express"),
	mongodb=require("mongodb"),
	sanitizeHTML=require("sanitize-html"),
	app=exp(),
	_port=process.env.PORT||8000,
	_collection="Items",
	conn="mongodb+srv://dbuser:******@asia-app.jdnir.mongodb.net/*****?retryWrites=true&w=majority"
	// conn="mongodb://localhost/TodoApp"
let db

//>> Database
mongodb.connect(conn,{useNewUrlParser:true},(err,client)=>{
	db=client.db()
	app.listen(_port,()=>{
		console.log(`Server running listening port ${_port}`)
	})
})

//>> Auth function
function userAuth(req,res,next){
	res.set('WWW-Authenticate','Basic realm="Todo App"')
	if(req.headers.authorization=="Basic bGVvaGVlODp3bzExZDEyNg=="){
		next()
	}else{
		res.status(401).send("Authentication required")
	}
}

//>> Grant folder permission
app.use(exp.static("public"))
//>> Request data
app.use(exp.json())
app.use(exp.urlencoded({extended:false}))
//>> Set security to the app globally
app.use(userAuth)
//>> Set security to specified path
//app.get("{path}",userAuth,(req,res)=>{})

//>> Output default page
app.get("/",(req,res)=>{
	db.collection(_collection).find().toArray((err,items)=>{
		res.send(`
			<!DOCTYPE html>
			<html>
			<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>${appName}</title>
			<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
			</head>
			<body>
			<div class="container">
				<h1 class="display-4 text-center py-1">${appName}</h1>
				<div class="jumbotron p-3 shadow-sm">
					<form id="form">
						<div class="d-flex align-items-center">
							<input name="itemName" id="itemName" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
							<button class="btn btn-primary">Add Item</button>
						</div>
					</form>
				</div>
				<ul id="item-list" class="list-group pb-5"></ul>
			</div>
			<script>const todoItems=${JSON.stringify(items)}</script>
			<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
			<script src="/app.js"></script>
			</body>
			</html>
		`)
	})
})

//>> Form post
app.post("/create-item",(req,res)=>{
	if(req.body.item!==""){
		const _data={
			item:sanitizeHTML(req.body.item,{
				allowedTags:[],
				allowedAttributes:{}
			})
		}
		db.collection(_collection).insertOne(_data,(err,data)=>{
			//>> Return new created data
			res.json(data.ops[0])
		})
	}else{res.send(`Item cannot be blank`)}
})

//>> Update
app.post("/update-item",(req,res)=>{
	db.collection(_collection).findOneAndUpdate(
		{_id:new mongodb.ObjectId(req.body.id)},
		{$set:{
			item:sanitizeHTML(req.body.item,{
				allowedTags:[],
				allowedAttributes:{}
			})
		}},
		()=>{res.send(`Updated`)}
	)
})

//>> Delete
app.post("/delete-item",(req,res)=>{
	db.collection(_collection).deleteOne(
		{_id:new mongodb.ObjectId(req.body.id)},
		()=>{res.send(`Deleted`)}
	)
})
