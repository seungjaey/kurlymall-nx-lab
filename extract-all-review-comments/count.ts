import commentSubset from './COMMENTS_SUBSET.json';

const filterTextMap = ['빈칸','여백','공백','줄바꿈','띄어쓰기','prettier','프리티어'];

interface CommentInterface {
  url: string;
  created_at: string;
  body: string;
  login: string;
  id: number;
}

const run = async () => {
  const comments = commentSubset as CommentInterface[];
  let allCount = 0;

  /**
   * 성진님 lint 개선 PR 기준
   * https://github.com/thefarmersfront/kurlymall-nx/pull/2703/files
   */
  const lastTime = new Date('2022-08-11T00:00:00Z').getTime();

  const filtered = comments.filter((comment) => {
    const isAlive = new Date(comment.created_at).getTime() < lastTime;
    const isFilteredComment = new RegExp(filterTextMap.join('|')).test(comment.body);

    if(isAlive) allCount++;

    return isAlive && isFilteredComment;
  });

  console.log(allCount, filtered.length);
}

run();