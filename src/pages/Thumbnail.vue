<template>
  <q-page>
    <h3>Thumbnail Generator</h3>
    <p>
      With great power comes great responsibility.<br>
      <br>
      <strong><em>DO NOT UPLOAD INAPPROPRIATE CUSTOM IMAGES TO COURSE WORLD!</em></strong><br>
      <br>
      This tool is intended for producing thumbnails for your own Course Bot. It is not intended
      for uploading custom images to Course World. If you upload inappropriate images to Course
      World, Nintendo will likely ban you.<br>
      <br>
      As for <em>how</em> to use these thumbnails on your Switch, you will find no instructions
      here. If you know, you know.<br>
      <br>
      Be responsible and don't ruin this for everyone.<br>
      <br>
      <br>
      <em>- Wizulus</em>
    </p>
    <form method="POST" action="/rest/generate-thumbnail" enctype="multipart/form-data">
      <div>Choose an image file:</div>
      <input type="file" name="image" />
      <input type="submit" value="Generate" />
    </form>
  </q-page>
</template>
