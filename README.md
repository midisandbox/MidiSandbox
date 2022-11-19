
# [](https://midisandbox.com/wp-content/uploads/2022/11/ms_logo_transparent.png) Midi Sandbox

Midi Sandbox is a free collection of midi responsive widgets made for musicians, teachers, and students. Fill in the gaps of your music theory knowledge, enhance your creative process, communicate musical ideas efficiently, and create your own templates/tutorials.

The original idea for this project was to experiment with the many ways that midi can be used in combination with other web technologies to enhance music education. Since there are seemingly an infinite amount of ways to use midi in the browser, Midi Sandbox was intentionally structured to scale to support as many widgets as can be thought of. Equally as important, users can completely customize their own templates by choosing which widgets they want to use and how to arrange them. Consequently, there is no right or wrong way to use Midi Sandbox, but if you want to get some ideas you can check out the tutorials on our [home page](https://midisandbox.com) or [Youtube channel](https://www.youtube.com/channel/UC_BY6HSKHZgZDdBUypbiXmw/videos).

[](https://midisandbox.com/wp-content/uploads/2022/08/sandbox-setup-1.gif)

<hr>

# How to contribute

This public repo contains the core of Midi Sandbox with some missing features that you might find on midisandbox.com, such as the media player for the Sheet Music widget. However, this code still functions as a standalone web app and all updates to it will be merged into the full-featured web app that you see on our website.

If you just want to help out in general you can give us a ⭐ on Github.

## Provide feedback

Have an idea about how to improve Midi Sandbox, or a topic you want to discuss? Create a post on our [Discussions](https://github.com/midisandbox/MidiSandbox/discussions) page, and if it fits into our roadmap we will add it to our list of [Issues](https://github.com/midisandbox/MidiSandbox/issues).

Found an existing bug? You can go ahead to the Issues page directly and create a post there.

## Contribute Code

Feel free to fork this repo and experiment all you want, but if you have a specific idea you want to contribute, please create a new post in the Discussions page mentioned above. This way we can make sure it's something we'd like to add to this repo before you spend the time to work on the pull request, and we can give you some pointers on what sections of the code to modify.

Alternatively, take a look at our Issues page and find something that you'd like to work on, but make sure to comment and check if someone has already started on it.

Please follow [this workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962) for forking the repo, working on your own branch, and submitting a pull request.


**Setting up your development environment**
1. [Install the amplify cli and create a user to use for midisandbox development](https://docs.amplify.aws/cli/start/install/). This is necessary to automatically generate the api, storage, and auth resources in AWS which will be used for your personal development environment. Visit [this link](https://docs.amplify.aws/cli/start/workflows/) if you want to learn more about the below amplify commands, and check [backend-config.json](https://github.com/midisandbox/MidiSandbox/blob/master/amplify/backend/backend-config.json) to see exactly what resources will be created in your AWS account.
2. clone the MidiSandbox repo 
3. `cd MidiSandbox`
4. `amplify init`
5. `amplify status`
6. `amplify push -y`
7. `npm install`
8. `npm start`
9.  visit http://localhost:3000/ in your browser
