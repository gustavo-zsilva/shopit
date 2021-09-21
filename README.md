# Shopit

Shopit helps you manage your shopping lists in an easy and practical way.
It's recommended for people who are constantly in need of remembering what they had to buy on a store,
or people that have to be writing their lists on paper. If that's your case, Shopit will surely help you.

This app was intirely made with React Native w/ Expo and Typescript.

## Technologies

- React Native
- Expo
- React Navigation
- uuid
- Async Storage
- Typescript

## Things I learned

This project made a huge diference on how I think my personal projects, majorly because it was kinda hard to plan how things would work.
I learned how to use Navigation in React Native, because you can't use links like in a plain HTML file.
When refactoring the whole project, I had to rethink the model I was using to fetch all the data. I stored all the app data in one big array, and if the app growed larger I knew this
would be a performance issue. So I made two arrays that connected bythe same Id, and I think this made a pretty big difference on the project.
I implemented two contexts also, that was kinda tricky because every component needed some information, so I had to think very accuratelly to make it work.

In the end, witha lot of energy and thinking to solve every issue, everything worked, and honestly I had lots of fun making Shopit.
