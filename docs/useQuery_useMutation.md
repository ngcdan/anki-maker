## useMutation, useQuery

`@tanstack/react-query` là một thư viện mạnh mẽ dùng để quản lý trạng thái dữ liệu trong các ứng dụng React,
đặc biệt là khi làm việc với dữ liệu không đồng bộ như API calls. Hai hook chính mà bạn hỏi đến là `useQuery` và `useMutation`.
Hãy cùng phân tích chúng qua các ví dụ và tình huống sử dụng cụ thể.

### 1. `useQuery`

#### Giải thích:
`useQuery` là một hook được sử dụng để lấy và lưu trữ dữ liệu từ các nguồn như API, thường là các yêu cầu GET.
Nó quản lý vòng đời của việc lấy dữ liệu, bao gồm các trạng thái như loading, success, và error. `useQuery` cũng hỗ trợ
 các tính năng như cache, làm mới dữ liệu, và quản lý các thay đổi dữ liệu tự động.

#### Trường hợp sử dụng:
Giả sử bạn có một ứng dụng cần hiển thị danh sách người dùng từ một API. Khi ứng dụng chạy,
bạn muốn lấy danh sách người dùng này và hiển thị lên màn hình. `useQuery` sẽ giúp bạn thực hiện điều này.

#### Cách sử dụng:
```javascript
import { useQuery } from '@tanstack/react-query'

function UsersList() {
  // Thực hiện một truy vấn để lấy danh sách người dùng
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'], // Khóa truy vấn để định danh unique query
    queryFn: () => fetch('/api/users').then(res => res.json()), // Hàm thực hiện việc lấy dữ liệu
  })

  // Kiểm tra các trạng thái của query
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error fetching data</div>

  // Hiển thị danh sách người dùng
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

#### Các trạng thái chính của `useQuery`:
- `isLoading`: Đang tải dữ liệu.
- `error`: Có lỗi xảy ra trong quá trình tải dữ liệu.
- `data`: Dữ liệu đã được tải thành công.

#### Tính năng đặc biệt:
- **Caching**: Dữ liệu được cache lại, giúp giảm tải số lần gọi API không cần thiết.
- **Refetching**: Tự động lấy lại dữ liệu khi dữ liệu cache hết hạn hoặc có sự kiện trigger (như người dùng tương tác).
- **Pagination và Infinite Scrolling**: Hỗ trợ lấy dữ liệu theo trang hoặc cuộn vô hạn.

### 2. `useMutation`

#### Giải thích:
`useMutation` là một hook được sử dụng để thực hiện các hành động thay đổi dữ liệu như POST, PUT, DELETE (thường không phải là GET).
Không giống `useQuery`, `useMutation` không được tự động thực thi khi component mount mà bạn cần gọi nó một cách thủ công.

#### Trường hợp sử dụng:
Giả sử bạn có một form để tạo mới người dùng. Khi người dùng nhập thông tin và nhấn nút "Submit", dữ liệu này cần được gửi đến API.
`useMutation` sẽ giúp bạn thực hiện việc này.

#### Cách sử dụng:
```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreateUserForm() {
  const queryClient = useQueryClient()

  // Sử dụng useMutation để gửi dữ liệu form tới server
  const mutation = useMutation({
    mutationFn: (newUser) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    onSuccess: () => {
      // Khi mutation thành công, có thể dùng để refetch lại dữ liệu
      queryClient.invalidateQueries(['users'])
    },
  })

  // Xử lý submit form
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const newUser = {
      name: formData.get('name'),
    }

    // Gọi mutation để thực hiện POST
    mutation.mutate(newUser)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Enter name" required />
      <button type="submit">Create User</button>

      {mutation.isLoading && <div>Creating user...</div>}
      {mutation.isError && <div>Error creating user</div>}
      {mutation.isSuccess && <div>User created successfully!</div>}
    </form>
  )
}
```

#### Các trạng thái chính của `useMutation`:
- `isLoading`: Đang thực hiện mutation.
- `isError`: Có lỗi xảy ra trong quá trình mutation.
- `isSuccess`: Mutation thực hiện thành công.

#### Tính năng đặc biệt:
- **Optimistic Updates**: Cập nhật UI trước khi mutation hoàn tất, tạo cảm giác nhanh nhạy cho người dùng.
- **Error Handling**: Xử lý lỗi một cách hiệu quả khi có lỗi từ server.
- **Callbacks**: Các hàm `onSuccess`, `onError`, `onSettled` để xử lý các tình huống sau khi mutation hoàn thành.

---

### 2. **Asynchronous Programming: Promises và async/await**

#### a) **Promises**

- **Khái niệm**: Promise là một đối tượng đại diện cho một hoạt động không đồng bộ (asynchronous operation) mà kết quả
của nó sẽ có ở một thời điểm trong tương lai. Promise có thể ở một trong ba trạng thái: *pending* (đang chờ), *fulfilled* (hoàn thành), hoặc *rejected* (bị từ chối).

- **Ví dụ với analogy**:
  Hãy tưởng tượng bạn đặt một chiếc bánh pizza qua điện thoại. Lời hứa (Promise) của tiệm bánh là sẽ giao bánh cho bạn.
   Trạng thái *pending* là khi pizza đang được làm. Khi pizza được giao, trạng thái chuyển thành *fulfilled*. Nếu họ không giao được, trạng thái sẽ là *rejected*.

```javascript
const pizzaOrder = new Promise((resolve, reject) => {
  const success = true; // Giả sử đơn hàng thành công
  if (success) {
    resolve('Pizza đã sẵn sàng!'); // Promise hoàn thành
  } else {
    reject('Giao hàng thất bại.'); // Promise bị từ chối
  }
});

pizzaOrder
  .then((message) => console.log(message)) // Khi Promise hoàn thành
  .catch((error) => console.log(error)); // Khi Promise bị từ chối
```

#### b) **async/await**

- **Khái niệm**: `async/await` là cú pháp giúp làm việc với Promise dễ dàng hơn, bằng cách viết code không đồng bộ trông giống như đồng bộ.
 `async` là từ khóa khai báo một hàm không đồng bộ, và `await` là từ khóa để chờ đợi một Promise hoàn thành.

- **Ví dụ với analogy**:
  Hãy tưởng tượng bạn là người làm pizza, nhưng thay vì đứng chờ, bạn tiếp tục làm việc khác cho đến khi pizza sẵn sàng.
   Khi bạn dùng `await`, bạn đang nói rằng: "Chờ chút, tôi cần pizza này trước khi làm bước tiếp theo".

```javascript
async function orderPizza() {
  try {
    const result = await pizzaOrder(); // Đợi đến khi pizza được giao
    console.log(result); // Hiển thị kết quả khi pizza sẵn sàng
  } catch (error) {
    console.log(error); // Bắt lỗi nếu có
  }
}
```

---

### Quay lại với `useQuery` và `useMutation`

- **`useQuery`**: Khi bạn sử dụng `useQuery`, nó hoạt động giống như việc gọi một Promise bên trong `useEffect`.
Nhưng thay vì bạn tự tay quản lý mọi thứ, `useQuery` tự động làm điều đó cho bạn, giúp đơn giản hóa việc lấy dữ liệu và quản lý trạng thái của nó.

- **`useMutation`**: `useMutation` thì tương tự như việc tạo một Promise và đợi kết quả bằng `async/await`,
nhưng nó tập trung vào việc thay đổi dữ liệu (POST, PUT, DELETE) thay vì lấy dữ liệu (GET).

---
