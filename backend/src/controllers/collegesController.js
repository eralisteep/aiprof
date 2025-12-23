async function getColleges(req, res) {
    try {
        const { ids } = req.body
        if (ids){
            // if(Array.isArray(ids)){
            //     let response = []
            //     ids.forEach(id => {
            //         const snapshot = await req.db.collection('colleges').where('id' == id)
            //         response += snapshot.doc
            //     })
            //     res.json(response)
            // }
            const snapshot = await req.db.collection('colleges').where('id' == ids).get()
            console.log(snapshot)
            res.json(snapshot.doc)
        } else {
        const snapshot = await req.db.collection('colleges').get()
        console.log(snapshot)
        res.json(snapshot.docs.map(doc => doc.data()))
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }

}
export default getColleges