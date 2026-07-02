export interface SampleQuestion {
  number: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: number;
}

export const sampleQuestions: SampleQuestion[] = Array.from({ length: 60 }, (_, i) => {
  const num = i + 1;
  
  // Custom tech questions
  const techQuestions = [
    {
      content: "OSI 7계층 중 물리적 매체를 통해 비트 스트림을 전송하는 계층은?",
      option1: "물리 계층 (Physical Layer)",
      option2: "데이터 링크 계층 (Data Link Layer)",
      option3: "네트워크 계층 (Network Layer)",
      option4: "전송 계층 (Transport Layer)",
      answer: 1
    },
    {
      content: "다음 중 자바스크립트(JavaScript)에서 비동기 처리를 위해 사용되지 않는 것은?",
      option1: "Promise",
      option2: "async / await",
      option3: "Callback Function",
      option4: "Synchronous Thread",
      answer: 4
    },
    {
      content: "데이터베이스의 ACID 특성 중, 트랜잭션의 연산이 데이터베이스에 모두 반영되거나 아예 반영되지 않아야 함을 의미하는 것은?",
      option1: "원자성 (Atomicity)",
      option2: "일관성 (Consistency)",
      option3: "격립성 (Isolation)",
      option4: "지속성 (Durability)",
      answer: 1
    },
    {
      content: "HTTP 상태 코드 중 '404 Not Found'의 의미는 무엇인가요?",
      option1: "서버가 요청을 이해하지 못함 (Bad Request)",
      option2: "인증이 필요함 (Unauthorized)",
      option3: "요청한 리소스를 찾을 수 없음 (Not Found)",
      option4: "서버 내부 오류 (Internal Server Error)",
      answer: 3
    },
    {
      content: "인터넷 계층의 프로토콜로, IP 패킷 전송 중 오류 발생 시 통제/통보하기 위해 사용되는 것은?",
      option1: "TCP",
      option2: "UDP",
      option3: "ICMP",
      option4: "DHCP",
      answer: 3
    },
    {
      content: "프로그램 개발 시 변경 사항을 버전별로 기록 및 관리하는 분산 버전 관리 시스템은?",
      option1: "Docker",
      option2: "Git",
      option3: "Kubernetes",
      option4: "Jenkins",
      answer: 2
    },
    {
      content: "CSS 레이아웃 방식 중 1차원 배치를 위해 설계되었으며, 행 또는 열을 기준으로 요소를 정렬하는 것은?",
      option1: "Grid Layout",
      option2: "Position Layout",
      option3: "Flexbox Layout",
      option4: "Float Layout",
      answer: 3
    },
    {
      content: "웹 표준 기술 중 문서의 논리적 구조와 표현 방식을 정의하고 동적으로 제어할 수 있게 돕는 객체 모델은?",
      option1: "DOM (Document Object Model)",
      option2: "BOM (Browser Object Model)",
      option3: "JSON",
      option4: "XML",
      answer: 1
    },
    {
      content: "다음 중 가상 메모리 관리 기법에서 페이지 부재(Page Fault)가 발생했을 때 가장 오랫동안 사용되지 않은 페이지를 교체하는 알고리즘은?",
      option1: "FIFO (First-In, First-Out)",
      option2: "LRU (Least Recently Used)",
      option3: "LFU (Least Frequently Used)",
      option4: "OPT (Optimal Replacement)",
      answer: 2
    },
    {
      content: "클라우드 서비스 모델 중 인프라(서버, 스토리지, 네트워크)를 가상화하여 서비스 형태로 제공하는 것은?",
      option1: "SaaS (Software as a Service)",
      option2: "PaaS (Platform as a Service)",
      option3: "IaaS (Infrastructure as a Service)",
      option4: "FaaS (Function as a Service)",
      answer: 3
    }
  ];

  // Rotate questions to fill all 60
  const baseQ = techQuestions[i % techQuestions.length];
  
  return {
    number: num,
    content: `[문제 ${num}] ${baseQ.content} (시뮬레이션 문항)`,
    option1: baseQ.option1,
    option2: baseQ.option2,
    option3: baseQ.option3,
    option4: baseQ.option4,
    answer: baseQ.answer
  };
});
