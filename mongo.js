/* eslint-disable no-fallthrough */
const mongoose = require("mongoose")

switch (process.argv.length) {
case 2:
	console.log("give password as argument")
	process.exit(1)
case 4:
	console.log("give phone number as argument")
	process.exit(1)
}

const password = process.argv[2]

const url =
	`mongodb+srv://mikkoykspetaja:${password}@fso-puhelin.8uxzsuq.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model("Person", personSchema)

if (process.argv.length >= 5) {
	const name = process.argv[3]
	const number = process.argv[4]

	const person = new Person({
		name: name,
		number: number,
	})

	person.save().then(result => {
		console.log(`Added ${name} number ${number} to phonebook`)
		mongoose.connection.close()
	})
}
else {
	Person.find({}).then(persons => {
		const personsMapped = persons.map(person => `${person.name} ${person.number}`)
		console.log(`phonebook: \n${personsMapped.join("\n")}`)
		mongoose.connection.close()
	})
}