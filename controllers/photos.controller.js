const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0]; // 1 Błąd: add walidacja rozszerzenia zdjęcia

      const patternText = /^[A-Z|a-z|0-9|_|-| ]{1,}$/;
      const patternEmail = /^[A-Z|a-z|0-9]+@[A-Z|a-z|0-9]+\.[a-zA-Z]{2,4}$/;

      const correctTitle = title.match(patternText).join('');
      const correctAuthor = author.match(patternText).join('');
      const correctEmail = email.match(patternEmail).join('');

      // 1 Błąd: add walidacja rozszerzenia zdjęcia
      if(fileExt === 'gif' || fileExt === 'jpg' || fileExt === 'png' && title === correctTitle && author === correctAuthor && email === correctEmail ) {
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
      throw new Error('Wrong input!');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const clientIp = requestIp.getClientIp(req); // szukamy IP głosującego
      const voter = await Voter.findOne({ user: clientIp }); // przypisujemy głosującego do IP
      if (!voter) { // jeżeli nie mmay w bazie głosującego dodajemy newVoter
        const newVoter = new Voter({ 
          user: clientIp, 
          votes: [ photoToUpdate._id ] 
        });
        await newVoter.save();
      } else { 
        if (voter.votes.includes(photoToUpdate._id)) { // jeżeli w bazie jest głosujący nie pozwalamy mu znowu głosować
          throw new Error('You have already voted!');
        } else { // jeżeli nie mmay w bazie głosującego dodajemy głos
          voter.votes.push(photoToUpdate._id);
          await voter.save();
        }
      }

      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
