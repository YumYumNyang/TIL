
## Synchronization Hardware
- 많은 시스템은 critical section code를 실행하기 위한 hardware support를 제공한다.
- 모든 솔루션은 Locking에 기반. : lock을 통해 임계 지역을 보호.
- Uniprocessors 는 interrupt를 disable할 수 있음.
  - 현재 수행하는 코드는 preemption없이 실행할 것임.
  - 일반적으로 멀티프로세서 시스템에서는 너무나 비효율적인 방법.
    - 멀티프로세서에서는 mutual exclusion도 보장이 되지 않고, interrupt를 disable시키는 것은 솔루션이 될 수 없다.
- Modern machines은 특별한 atomic hardware instruction을 제공한다. atomic == non-interruptible
  - example
    - test memory word and set value
    - swap contents of two memory words

![alt text](../img/8.png "8.png")


## test_and_set Instruction 
```
boolean test_and_set(boolean *target)
{
  boolean rv = *target;
  *target  = TRUE;
  return rv;
}
```
- test : target 주소 메모리 값을 확인함.
- set : target 주소에 해당하는 메모리 값을 true로 setting.
- atomic하게 동작.
- 넘겨받은 매개변수의 원래 값을 리턴.
- 넘겨받은 매개변수를 새로운 값으로 세팅 (TRUE 로)


- 공유된 불리언 변수 lock은 false로 초기화 됨.
```
do{
  while(test_and_set(&lock)){ // lock은 프로세스간 공유된 값, 초기에 false. 이때 while을 벗어나 cs 진입가능함. 나중에 lock을 true로 세팅하여 while에 남도록함. 
    /* 아무일도 없음 */
  }
  /*critical section*/
  lock = false; // cs를 떠날 때, lock을 false로 세팅해 다른 프로세스가 cs에 진입할 수 있도록 해줌.
  /*remainder section*/
}while(true);
```

## compare_and_swap Instruction
``` 
int compare_and_swap(int * value, int expected, int new_value){
  int temp = *value;
  if(*value == expected)
    *value = new_value;
  return temp;
}
```
- compare: 해당 주소의 값이 expected와 같으면 swap: 새로운 값으로 바꿈.
- atomic하게 동작.
- 공유된 integer lock은 0으로 초기화.
```
do {
  while(compare_and_swap(&lock, 0, 1) !=0){
    ; /* do nothing */
  }
  /* critical section */
  lock = 0;
  /* remainder section */
}while(true)
```

- lock의 값이 1이면 계속 기다림
- lock 값이 expected 즉, 0과 같으면 while문 나와서 cs 진입.
- 진입하자마자 다른 진입 막기위해서 new value 를 1로 바꿈 
- Bounded Waiting 만족 못함.

## Bounded-waiting Mutual Exclusion with test_and_set
- boolean waiting[n]
- boolean lock;
- 모두 false 로 초기화 
- Pi가 waiting, key가 true인 상태, cs 진입하기 위해 test_and_set을 체크함.
- lock이 false 값이면, (다른 프로세스에 의해 lock되어 있지 않은 상태, 아무도 cs 에 없는 상태.) key가 false가 되어 cs에 진입.
- 자신은 cs에 진입하고, lock을 1로 세팅해서 다른 프로세스의 진입을 막는다.
- cs영역 진입후에, 자신의 waiting 을 false로 바꾸어 waiting 하지 않음을 알린다.
- cs에서 나오면서 다른 pj 상태를 i+1, ... , i-1까지 순환하면서 체크
- waiting 하는 j가 있으면 해당 j waiting을 false로 바꿔준 다음, 해당 pj가 cs에 진입가능하도록 하고, 이 pj가 cs에 진입할 수 있도록 lock을 풀어준다.
=> Bounded waiting requirement is satisfied (한정된 대기 조건 만족. 한 프로세스가 cs을 실행한 후에 반드시 다른 프로세스가 적어도 한번은 cs에 진입할 수 있으므로)

```
do{
  waiting[i] = true;
  key = true;
  while(waiting[i] && key ) key = test_and_set(&lock);
  waiting[i] = false;
  /* critical section */
  j = (i+1)%n;
  while((j!=i) && !waiting[j])
    j = (j+1)%n;
  if(j==i)
    lock = false;
  else
    waiting[j] = false;
  /* remainder section */ 
}while(true);
```



## Mutex Locks
- 이전의 솔루션들은 복잡하고 일반적으로 프로그래머들이 응용하기에는 힘들다.
- Os 설계자가 critical section problem을 해결할 툴을 개발한다. 
- Mutex lock이 가장 단순하다.
- Critical section을 acquire()를 통해 lock을 가져오고 release()를 통해 lock을 푸는 것으로 보호한다.
- acquire() 와 release()는 atomic하게 동작해야만 한다. (대게 하드웨어 atomic 명령어로 실행된다.)
- 하지만 이 솔루션은 _busy waiting_ 이 필요하다. 그래서 이 lock은 spinlock이라고도 불린다. 

## 

```
acquire(){
  while(!available)
    ; /* busy waiting */
  available = false;
}
release(){
  available = true;
}

do{
  acquire lock
    critical section
  release lock
    remainder section
}while(true);
```
- acquire() : lock 획득
- release() : lock 반환
- mutex lock은 available 이라는 불리언 타입의 변수를 가짐. 이 available 변수는 lock의 가용여부를 표시함.
- lock을 사용할 수 있으면 acquire()호출 성공하고 lock은 곧 사용불가 상태로 바뀜.
- 단점은 busy waiting을 해야하므로 cpu를 소비한다는 점이다. 


## Semaphore

- sema는 그리스어로 sign을 의미함.
- Mutex lock에 비해 좀 더 정교한 프로세스 동기화 툴이다. 
- Semaphore S - integer variable
- 오직 나누어 질수없는 즉, atomic하고 indivisible한 operation에 의해서만 접근이 될 수 있다. 
  - wait(), signal()
    - P()와 V() 라고 불림. (P: Proberen 검사하다. V:Verhogen 증가하다. 네덜란드어)
- wait() operation 의 정의
```
  wait(S){
    while(S<=0)
      ; // busy wait
    S--; // atomic operation interrupt 없음.
  }
```
- signal() operation의 정의
```
signal(S){
  S++;
} // atomic operation
```

## Semaphore Usage
- Counting Semaphore : 정수값이 제한되지 않은 영역 사이의 값을 가질 수 있다.
- Binary Semaphore : 정수값이 오직 0과 1 사이만 가능.
  - mutex lock과 같은 역할. 상호배제 목적으로만 사용가능.
- 다양한 동기회 문제를 해결할 수 있다. 
- p1과 p2가 s1를 필요로 하고, s1은 s2전에 수행되어야 한다고 가정하자.
- p1은 s1 명령문은, p2는 s2 명령문을 수행함, p1과 p2는 병행 수행.
- p1,p2는 semaphore __synch__ 를 공유함. synch 는 0 으로 초기화

### P1: 
S1;
signal(synch);

### P2:
wait(synch);
S2;


process p1은 s1을 무조건 실행하고, s1 실행후에, signal(synch)가 실행되면 synch값은 증가. p2는 wait에 도달. p1의 s1 실행 후, signal(synch) 실행 전까지는 synch 가 0이므로 wait()을 벗어날 수 없음. s1 다음에 s2가 실행되는 것이 보장된다고 할 수 있음.
__S를 binary semaphore로써 사용해 수행할 수 있음.__

## Semaphore Implementation
- 두개의 프로세서에서 wait()과 signal()이 같은 semaphore에서 동시에 수행될 수 없다는 것이 보장되어야 함.
- 그래서 이 동작이 critical section problem이 되는데 critical section에 wait과 signal이 존재한다.
- 결국 busy waiting 이 발생함. 
  - 하지만 수행 코드가 매우 짧고 critical section이 선점되는 경우가 적어 busy waiting이 조금 발생한다.
- 이 방법은 application이 critical section에서 많은 시간을 소요할 수 있기 때문에 좋은 솔루션이 아니다.


## Semaphore Implementation with no Busy waiting
- 기존 busy waiting하는 semaphore 문제 해결 
  - wait() 연산 실행 후, semaphore 값이 양수가 아니면, 프로세스를 waiting queue에 넣고 해당 프로세스는 waiting state로 됨. -> 스케줄러는 다른 프로세스를 선택 실행.
  - waiting queue에 대기하는 프로세스는 signal()의 wakeup()에 의해 waiting state을 ready state으로 변경한다. ready queue에서 스케줄링이 됨.
  - 즉 계속 wait에서 대기하고 있는 것이 아니라 큐에 넣어줌으로써 busy waiting을 하지 않도록 하는 것임.

- 각 semaphore은 연관된 waiting queue가 존재.
- 각 waiting queue로의 진입은 2개의 데이터가 있음.
  - value (integer)
  - 리스트에 있는 다음 기록의 포인터
- 2개의 동작
  - block : 적합한 waiting queue에서 operation이 발생하도록 process를 위치시키는 것.  
  - wakeup : waiting queue에 있는 프로세스 중 하나를 삭제하고, 그것을 ready queue로 옮긴다.

```
typedef struct{
  int value;
  struct process *list; // list란? semaphore를 기다리는 프로세스들
} semaphore;


wait(semaphore *S){
  S->value--; //value 값은 semaphore를 기다리는 프로세스들의 수;
  if(S->value < 0){
    add this process to S->list; 
    // 프로세스가 semaphore를 기다려야 한다면, 이 프로세스는 semaphore의 process list에 추가된다. 그리고 해당 프로세스는 waiting state로 감.
    block(); // 자신을 호출한 프로세스를 중지시킴.
  }
}

signal(semaphore *S){
  S->value--;
  if(S->value <= 0){
    remove a process P from S->list; // list에는 semaphore를 기다리는 프로세스들이 있는데, signal은 process list에서 하나의 프로세스를 꺼내서 wakeup 을 함. 
    wakeup(P); // block된 프로세스 P의 실행을 재개함.
  }
}

```

## Deadlick and Starvation 

### Deadlock : 두개 이상의 프로세스들이 waiting하는 프로세스들 중 하나에게만 일어날 수 있는 이벤트를 무한정 기다리는 것을 말한다. 

- 1으로 초기화된 S 와 Q라는 semaphore가 있다고 생각하면,

P0 : wait(S); wait(Q); ... signal(S); signal(Q);

P1 : wait(Q); wait(S); ... signal(Q); signal(S);

P0가 wait(S)를 실행하고 P1이 wait(Q)를 실행한 후 P0는 wait(Q) 상황에서 진행이 되려면,P1이 signal(Q)를 실행해야 한다. 그런데 이를 위해서는 P1의 wait(S) 상태를 넘어가야 하는데, 이를 위해서 P0가 signal(S)를 실행해줘야 한다. 둘다 각각 wait(Q)와 wait(S)를 넘어가지 못하고, 서로 상대방 semaphore 값을 기대하고 있다. 

- __starvation__ : __Indefinite blocking__ , 프로세스가 semaphore queue에서 지워지지 않고 계속 지속되는 것을 말한다. 
- Priority Inversion(우선순위 역전문제) : 낮은 우선순위의 프로세스가 높은 우선순위의 프로세스가 필요한 lock을 가지고 있는 것을 말한다. => Priority-inheritance protocol(우선순위 상속 프로토콜)로써 해결될 수 있음.


## Classical Problems of Synchronization 
- Bounded-Buffer problem
- Readers and Writers problem
- Dining-Philosophers problem


## Bounded-Buffer problem
- n개의 버퍼는 각각이 하나의 아이템만 가질 수 있음. 총 n개의 아이템을 가짐.
- Semaphore mutex : 1로 초기화 / buffer pool에 접근하기 위한 상호배제기능 제공.
- Semaphore full : 0으로 초기화 / 채워져 있는 버퍼의 개수를 말함.
- Semaphore empty : n으로 초기화 / 채워질 수 있는 버퍼의 개수를 말함.


```
//Producer
while(true){
  //produce an item
  wait(empty);
  wait(mutex);

  //buffer pool에 item 쓰기
  signal(mutex);
  signal(full);

  // 써야할 item이 있으면 empty한 버퍼슬롯이 있을때까지 기다리고 buffer pool에 item을 쓴다. 쓸 때 상호배제 필요.
}

//Consumer
while(true){
  wait(full);
  wait(mutex);

  // remove an item from buffer

  signal(mutex);
  signal(empty);

  // consume the removed item

  // 채워진 buffer가 있으면 즉, 읽을 아이템이 있으면 상호배제(mutex)상태에서 공유 buffer를 배타적으로 읽음. 읽은 후에 empty signal을 보냄.
}

```

n개의 버퍼로 구성되어있고 버퍼 하나씩 채워지거나 (full), 비워짐(empty)

## Readers-Writers problem
- 데이터 셋은 많은 동시발생의 프로세스들 사이에 공유된다.
  - Readers : 데이터셋을 읽기만함. 데이터를 수정하지 않는다.
  - Writers : 읽고 쓰기 둘다 가능하다.

- 문제? : 만약에 writer와 다른 프로세스(reader 또는 writer) 데이터베이스에 동시에 접근하면 혼란이 야기될 수 있다.
  - 해결방법: writers는 쓰기 작업할 동안에 공유 데이터에 대한 배타적 접근권한을 가지게 할 필요가 있다.

- 어떻게 readers와 writers가 고려되어 지는지에 대한 변형들
  - first readers-writers problem
    - writer가 공유자원을 이미 사용하고 있지 않는 한, reader들은 계속 wait할 필요없이 자원을 잡을 수 있음. 
    - first readers의 의미 : reader가 자원에 접근 가능
    - 문제점 : writer가 starvation에 빠질 수 있음.

  - Second readers-writers problem
    - Writer가 준비가 되면 asap하게 write함. 
    - reader 가 두번째 우선순위 writer가 우선임.
    - 문제점: reader 가 starvation이 될 수 있음.

### first readers-writers problem의 해결
- writer가 기아문제에 빠질 수 있는 문제임
- semaphore rw_mutex : 1로 초기화 / reader 와 writer 가 공유하는 semaphore임
- semaphore mutex : 1로 초기화 / read_count 갱신시 상호배제 보장용 semaphore
- integer read_count : 0으로 초기화 / 현재 몇개의 프로세서들이 이 객체를 읽는 지 알려줌

```
//writer process
do{
  wait(rw_mutex); // writer와 reader1개가 공유자원에 대한 r/w 경쟁하는 셈.
  ...
  /* writing is performed */
  ...
  signal(rw_mutex);
}while(true);


// reader process
do{
  wait(mutex); // mutex는 read_count에 대한 상호배제
  read_count++;
  if(read_count == 1)
    wait(rw_mutex);
  signal(mutex);
  ...
  /* reading is performed */
  wait(mutex);
    readcount--;
    if(read_count == 0)
    signal(rw_mutex);
  signal(mutex);
}while(true);
```

- writer 1개와 n개의 reader가 있는 상황에서, w1 -> r1 -> r2 -> r3 -> ... w1이 starvation이 되는 상황이 생길 수 있음.
- 이를 위해, writer와 하나의 첫번째 진입 reader가 rw_mutex semaphore을 공유하고 이 reader가 rw_mutex 사용시에 rw_mutex 값은 1에서 0으로 됨. (wait(rw_mutex))
- 나머지 N-1개의 readers 는 w1과 경쟁하지 못하게 하여, rw_mutex를 기다리지 않도록하여, w1이 starvation이 되는 상황을 제거.
- N-1 개의 readers 중에서 reading 순서 선택-> sheduler에 의함. 
- 이를 통해 reader들이 모두 reading되면 , rw_mutex값을 1로 만들어 다시 w1에 writing 순서를 넘겨주는 셈. 






