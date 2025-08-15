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
        chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({ text: 'Test thread', delete_password: testThreadPassword })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            testThreadId = res.body._id;
            assert.equal(res.body.text, 'Test thread');
            done();
        });
    });

    test('Get thread on board "testboard"', function(done){
        chai.request(server)
        .get(`/api/threads/${testBoard}`)
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);

            //Chack if at most is 10 threads
            assert.isAtMost(res.body.length, 10);

            //Check if there are 3 replies
            if(res.body.length > 0){
                assert.property(res.body[0], 'replies');
                assert.isAtMost(res.body[0].replies.length, 3);
            }
            done();
        });
    });

    test('Create a new reply on board "testboard"', function(done){
        chai.request(server)
        .post(`/api/replies/${testBoard}`)
        .send({thread_id: testThreadId, text: 'Test reply', delete_password: testReplyPassword })
        .end(function(err, res){
            assert.equal(res.status, 200);
            testReplyId = res.body.replies[0]._id || null;
            console.log('testreplyid:', testReplyId)
            done();
        });
    });

    test('Get reply from test thread on "testboard"', function(done){
        chai.request(server)
        .get(`/api/replies/${testBoard}`)
        .query({ thread_id: testThreadId })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            assert.isAtLeast(res.body.replies.length, 1);
            done();
        });
    });

    test('Report a reply on "testboard"', function(done){
        chai.request(server)
        .put(`/api/replies/${testBoard}`)
        .send( {thread_id: testThreadId, reply_id: testReplyId} )
        .end(function(err, res){
            assert.equal(res.text, "Sucessfully reported a reply!");
            done();
        });
    });

    test('Report a thread on "testboard"', function(done){
        chai.request(server)
        .put(`/api/threads/${testBoard}`)
        .send( { report_id: testThreadId } )
        .end(function(err, res){
            assert.equal(res.text, "Successfully Reported Thread!");
            done();
        });
    });
});
