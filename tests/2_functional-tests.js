const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testBoard = 'testboard';
    let testThreadId;
    let testReplyId;
    let testThreadPassword = 'threadpass';
    let testReplyPassword = 'replypass';

    test('Create a new thread on board "testboard"', function(done){
        chaiHttp.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({ text: 'Test thread', delete_password: testThreadPassword })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.equal(res.body.text, 'Test thread');
            done();
        });
    });

});
