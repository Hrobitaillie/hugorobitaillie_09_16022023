/**
 * @jest-environment jsdom
 */
import router from "../app/Router.js";
import { screen , waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

    })

    afterEach(()=>{
      document.body.innerHTML = '';
    })

    describe("When i upload a new file with on of this format: jpg, jpeg, png", () => {

      test("Then file should be updated and saved in bill", async() => {

        document.body.innerHTML = NewBillUI()

        // Define on navigate
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES_PATH.pathname
        }

        const content = new NewBill({
            document,
            onNavigate,
            store : null,
            localStorage : window.localStorage
        })

        const handleChangeFile = jest.fn(content.handleChangeFile)
        const fileInput = await waitFor(()=>screen.findByTestId('file'))

        console.log(fileInput);

        fileInput.addEventListener('change',handleChangeFile)



      })

    })

  })

})
