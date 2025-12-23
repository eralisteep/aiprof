async function getColleges(req, res) {
    try {
        const { ids } = req.body
        if (ids){
            if(Array.isArray(ids))
            {
                let response = []
                ids.forEach(id => {
                    const snapshot = req.db.collection('colleges').where('id' == id)
                })
                res.json(response)
            }
            const snapshot = req.db.collection('colleges').where('id' == id)
            res.json(snapshot.docs.map(doc => doc.data()))
        }
        res.json(req.db.collection('colleges').get())
    } catch (error) {
        res.status(500).json({error: error.message})
    }

}
export default getColleges