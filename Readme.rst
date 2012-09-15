.. default-domain:: js
.. highlight:: javascript

=============
buster-syntax
=============

    Stop syntax errors before they hit the browser

.. raw:: html

    <a href="http://travis-ci.org/busterjs/buster-syntax" class="travis">
      <img src="https://secure.travis-ci.org/busterjs/buster-syntax.png">
    </a>

Buster.JS extension that syntax checks files on the server before running them
in the browser (over ``ramp-capture-server``). Catching the errors early has one
primary goal: Avoid browsers with poor error handling to freeze if a test run
contains lots of errors. As a pleasant side-effect, you get consistent and
detailed syntax errors, regardless of target browser.

This extension ships with Buster.JS by default, so there's nothing to do to
enable it. If you want to do test runs in the browser without this extension,
you have to provide your own runner plumbing, see `buster docs
<http://github.com/busterjs/buster/>`_ for information on how.
