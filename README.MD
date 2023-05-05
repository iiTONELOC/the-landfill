# The Landfill

**`Coming Soon`**

![Men overlooking a construction site](https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80)

The Landfill powers the [TrashScan App](https://github.com/iiTONELOC/trashscan-app) and is a rework of the existing implementation. The first version of the project had a back end with a true microservice architecture, powered by Azure. The free tier is too slow and their cheapest instance isn't cheap enough to host a mostly private app.

Heroku has instances with TLS that are starting at $7 per month. I remember when they had free dynos they were faster than Azure App Service's free tier. For this reason the backend has been reworked from a RESTful to a GraphQL API and refactored to work on one instance. With a modular approach, if the time to scale does come, we can separate it back to individual microservices. The main goal here is to demo the idea for cheap.

## License

This project is not licensed for reuse at this time. If you like what you see please get in touch!

## Contact

Have questions?  
Constructive criticism, feedback, or would like to get in touch?

Feel free to email me at [anthonytropeano@protonmail.com](mailto:anthonytropeano@protonmail.com)

[Check out my GitHub!](https://github.com/iiTONELOC)
