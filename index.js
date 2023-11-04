require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const app = express()
const cors = require("cors")
const Person = require("./models/person")

morgan.token("content", function (req, res) { return JSON.stringify(req.body) })
app.use(express.static("dist"))
app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :content"))
app.use(cors())

app.get("/api/persons", (req, res) => {
    Person.find({})
        .then(persons => { res.json(persons) })
})

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) { res.json(person) }
            else { res.status(404).json({ error: "person was not found" }) }
        })
        .catch(error => next(error))
})

app.get("/info", (req, res) => {
    Person.find({})
        .then(persons => {
            const reply = `
            <p>Phonebook contains info for ${persons.length} people</p>
            <p>${Date()}</p>`

            res.send(reply)
        })
})

app.post("/api/persons", (req, res, next) => {
    const name = req.body.name
    const number = req.body.number

    const newPerson = new Person({
        name: name,
        number: number
    })

    newPerson.save()
        .then(savedPerson => {
            res.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
    const person = {
        name: req.body.name,
        number: req.body.number,
    }

    Person.findByIdAndUpdate(
        req.params.id,
        person,
        { new: true, runValidators: true, context: "query" }
    )
        .then(updatedPerson => {
            if (!updatedPerson) {
                const error = new Error("person was removed from the server")
                error.name = "UpdateError"
                throw error
            }
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === "UpdateError") {
        return res.status(404).send({ error: error.message })
    }

    if (error.name === "CastError") {
        return res.status(400).send({ error: "malformatted id" })
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({ errorName: error.name, errorMessage: error.message })
    }

    next(error)
}

app.use(errorHandler)