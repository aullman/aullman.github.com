== Building ==

In order to get the ant script to work you will need to install the Flex SDK. You need to copy the flexTasks.jar file to the build/lib/flex directory. Then you need to make sure all of the necessary jars are in place from the frameworks and lib directory from your sdk. This will live somewhere like /Applications/Adobe\ Flash\ Builder\ 4/sdks/4.5.0/

For me on my Mac I did:

mkdir -p build/lib/flex
cp /Applications/Adobe\ Flash\ Builder\ 4/sdks/4.5.0/ant/lib/flexTasks.jar build/lib/flex/
cp -r /Applications/Adobe\ Flash\ Builder\ 4/sdks/4.5.0/frameworks build/lib/flex/
cp -r /Applications/Adobe\ Flash\ Builder\ 4/sdks/4.5.0/lib build/lib/flex/

ant


More details can be found at: http://livedocs.adobe.com/flex/3/html/help.html?content=anttasks_1.html